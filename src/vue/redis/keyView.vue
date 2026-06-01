<template>
  <div id="app">
    <el-container direction="vertical" class="key-tab-container">
      <!-- key info -->
      <el-form :inline="true">
        <!-- key name -->
        <el-form-item>
          <el-input ref="keyNameInput" v-model="edit.name" @keyup.enter="rename" :placeholder="t('redis.keyView.setToRenameKey')">
            <template #prepend><span class="key-detail-type">{{ key.type }}</span></template>
            <template #suffix><i class="el-icon-check el-input__icon cursor-pointer" :title="t('redis.keyView.clickToRename')" @click="rename">
            </i></template>
          </el-input>
        </el-form-item>

        <!-- key ttl -->
        <el-form-item>
          <el-input v-model="edit.ttl" @keyup.enter="ttlKey" type='number'>
            <template #prepend><span>{{ t('redis.keyView.ttl') }}</span></template>
            <template #suffix><i class="el-icon-check el-input__icon cursor-pointer" :title="t('redis.keyView.clickToChangeTtl')" @click="ttlKey">
            </i></template>
          </el-input>
        </el-form-item>

        <!-- del refresh key btn -->
        <el-form-item>
          <el-button type="danger" @click="deleteKey" icon="el-icon-delete"></el-button>
          <el-button type="success" @click="refresh" icon="el-icon-refresh"></el-button>
          <template v-if="key.type=='string'">
            <el-select v-model="selectedView" class='format-selector' :style='selectStyle' size='small' :teleported="false">
              <template #prefix><span class="fa fa-sitemap"></span></template>
              <el-option v-for="item in viewers" :key="item.value" :label="item.text" :value="item.value">
              </el-option>
            </el-select>
            <!-- save btn -->
            <el-form-item>
              <el-button type="primary" @click="update()">{{ t('redis.keyView.save') }}</el-button>
            </el-form-item>
          </template>
        </el-form-item>
      </el-form>

      <!-- key content -->
      <el-form class='key-content-string' v-if="key.type=='string'">
        <!-- key content textarea -->
        <el-form-item>

          <span v-if='binary' class='formater-binary'>Hex</span>
          <div class="value-panel" :style="'height:'+ dynamicHeight">
            <!-- 字符串 -->
            <div v-if="selectedView=='ViewerText'">
              <el-input type='textarea' :autosize="{ minRows:6}" v-model='edit.content'></el-input>
            </div>
            <!-- Json -->
            <div v-if="selectedView=='ViewerJson'">
              <pre v-html="editTemp" contenteditable="true" class="json-panel" @input="changeByJson"></pre>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <!-- array content -->
      <div v-if="key.type=='list' || key.type=='set' || key.type=='zset' || key.type=='hash' ">
        <div>
          <!-- add button -->
          <el-form :inline="true" size="small">
            <el-form-item>
              <el-button size="small" type="primary" @click='editDialogVisiable=true'>
                {{ t('redis.keyView.addNew') }}
              </el-button>
            </el-form-item>
          </el-form>
          <!-- edit & add dialog -->
          <el-dialog :title="dialogTitle" v-model="editDialogVisiable">
            <el-form>
              <el-form-item :label="t('redis.keyView.key')" v-if="key.type=='hash'">
                <el-input v-model="addKey"></el-input>
              </el-form-item>
              <el-form-item :label="t('redis.keyView.value')">
                <el-input v-model="addData"></el-input>
              </el-form-item>
            </el-form>
            <template #footer>
            <div class="dialog-footer">
              <el-button @click="editDialogVisiable = false">{{ t('redis.keyView.cancel') }}</el-button>
              <el-button type="primary" @click="confirmAdd">{{ t('redis.keyView.confirm') }}</el-button>
            </div>
            </template>
          </el-dialog>
        </div>
        <!-- content table -->
        <div>
          <el-table :data="key.content" stripe size="small" border>
            <el-table-column type="index" :label="t('redis.keyView.id')" sortable width="60" align="center">
            </el-table-column>
            <el-table-column v-if="key.type=='hash'" resizable sortable :label="t('redis.keyView.key')" align="center">
              <template #default="scope">
                {{scope.row.key}}
              </template>
            </el-table-column>
            <el-table-column resizable sortable show-overflow-tooltip :label="t('redis.keyView.value')" align="center">
              <template #default="scope">
                {{key.type=='hash'?scope.row.value:scope.row}}
              </template>
            </el-table-column>
            <el-table-column label="Operation" width="150" align="center">
              <template #default="scope">
                <el-button type="text" @click="showEditDialog(scope.row)" icon="el-icon-edit" circle  v-if="key.type=='hash'">
                </el-button>
                <el-button type="text" @click="deleteLine(scope.row)" icon="el-icon-delete" circle>
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- <el-pagination class="pagenation-table-page-container" v-if="dataAfterFilter.length > pageSize"
                        :total="dataAfterFilter.length" :page-size="pageSize" :current-page.sync="pageIndex"
                        layout="total, prev, pager, next" background>
                    </el-pagination> -->
        </div>
      </div>
      <!-- hset -->
    </el-container>
  </div>
</template>

<script>
import formatHighlight from "json-format-highlight";

import { getVscodeEvent } from "../util/vscode";
const prettyBytes = require("pretty-bytes");
let vscodeEvent;

export default {
  unmounted() {
    vscodeEvent.destroy();
  },
  mounted() {
    vscodeEvent = getVscodeEvent();
    vscodeEvent
      .on("detail", (data) => {
        this.key = data.res;
        this.edit = this.deepClone(data.res);
        this.editTemp = this.jsonContent();
        const temp = this.edit.content + "".trim();
        this.selectedView =
          temp.startsWith("[") || temp.startsWith("{")
            ? "ViewerJson"
            : "ViewerText";
      })
      .on("msg", (content) => {
        this.$message.success(content);
      })
      .on("refresh", () => {
        this.editDialogVisiable = false;
        this.editModel=false;
        this.addData = null;
        this.addKey = null;
        this.refresh();
      });
    vscodeEvent.emit("route-" + this.$route.name);
  },
  data() {
    return {
      addKey: "",
      addData: "",
      editModel: false,
      key: { name: "", ttl: -1, content: null },
      // copy from key
      edit: { name: "", ttl: -1, content: null },
      editTemp: null,
      editDialogVisiable: false,
      binary: false,
      selectStyle: { float: this.float },
      selectedView: "ViewerText",
      viewers: [
        { value: "ViewerText", text: "Text" },
        { value: "ViewerJson", text: "Json" },
      ],
      textrows: 6,
    };
  },
  computed: {
    dialogTitle() {
      const edit = this.editModel;
      switch (this.key.type) {
        case "hash":
          return edit ? "Edit Hash" : "Add to hash";
        case "set":
          return edit ? "Edit Set" : "Add to set";
        case "zset":
          return edit ? "Edit ZSet" : "Add to zset";
        case "list":
          return edit ? "Edit List" : "Add to list";
      }
      return "";
    },
    dynamicHeight() {
      return window.innerHeight - 100 + "px";
    },
  },
  methods: {
    changeByJson(event) {
      this.edit.content = event.target.innerText;
    },
    /**
     * Sanitize HTML from formatHighlight to prevent XSS.
     * Only allows <span style="..."> tags, escapes everything else.
     */
    sanitizeHighlight(html) {
      if (!html) return '';
      // Remove all tags except <span> with style attribute
      return html.replace(/<(?!\/?span\b[^>]*>)[^>]+>/gi, (match) => {
        // Allow only <span style="..."> tags
        if (/^<span\s+style="[^"]*"$/i.test(match)) return match;
        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      });
    },
    jsonContent() {
      try {
        const highlighted = formatHighlight(JSON.parse(this.edit.content), {
          keyColor: "#C792EA",
          numberColor: "#CE9178",
          stringColor: "#92D69E",
          trueColor: "#569cD6",
          falseColor: "#569cD6",
          nullColor: "#569cD6",
        });
        return this.sanitizeHighlight(highlighted);
      } catch (error) {
        return this.edit.content;
      }
    },
    refresh() {
      vscodeEvent.emit("refresh", { key: this.key });
    },
    confirmAdd() {
      vscodeEvent.emit("add", {
        key: this.addKey,
        value: this.addData,
        editModel: this.editModel,
      });
    },
    showEditDialog(row) {
      this.addKey=row.key
      this.addData=row.value
      this.editModel=true;
      this.editDialogVisiable=true
    },
    deleteLine(row) {
      vscodeEvent.emit("deleteLine", row);
    },
    deleteKey() {
      this.$confirm(this.t('redis.keyView.confirmDeleteKey'), this.t('common.warning'), {
        confirmButtonText: this.t('common.ok'),
        cancelButtonText: this.t('common.cancel'),
        type: "warning",
      }).then(() => {
        vscodeEvent.emit("del", { key: { name: this.key.name } });
        this.key = {};
        this.edit = {};
      });
    },
    rename() {
      vscodeEvent.emit("rename", {
        key: { name: this.key.name, newName: this.edit.name },
      });
    },
    ttlKey() {
      vscodeEvent.emit("ttl", {
        key: { name: this.key.name, ttl: this.edit.ttl },
      });
    },
    update() {
      vscodeEvent.emit("update", {
        key: {
          name: this.key.name,
          type: this.key.type,
          content: this.edit.content,
        },
      });
    },
    deepClone(obj) {
      try {
        return structuredClone(obj);
      } catch {
        // Fallback for non-cloneable values (e.g. functions)
        return JSON.parse(JSON.stringify(obj));
      }
    },
  },
};
</script>
<style scoped>
/* 主容器 */
.key-tab-container {
  margin-top: 10px;
  padding: 16px;
  background-color: var(--vscode-editor-background);
}

/* JSON 面板 - 使用 VS Code 编辑器样式 */
.json-panel {
  line-height: 1.5;
  background: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
  font-family: var(--vscode-editor-font-family, var(--vscode-font-family));
  color: var(--vscode-foreground);
  padding: 12px;
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
  overflow: auto;
  min-height: 150px;
}

/* 值面板 */
.value-panel {
  overflow: auto;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
  padding: 8px;
}

/* 表单样式 */
:deep(.el-form-item) {
  margin: 4px 8px 4px 0 !important;
}

:deep(.el-input__inner) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-input-foreground) !important;
}

:deep(.el-input-group__prepend) {
  background-color: var(--vscode-dropdown-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-foreground) !important;
}

/* 头部信息 */
.key-header-info {
  margin-top: 16px;
}

.key-content-container {
  margin-top: 16px;
}

/* 过滤输入框 */
.key-detail-filter-value {
  width: 60%;
  height: 28px;
  padding: 0 8px;
  background: var(--vscode-input-background);
  border: 1px solid var(--vscode-input-border, var(--vscode-dropdown-border));
  color: var(--vscode-input-foreground);
  border-radius: 2px;
}

/* 二进制内容样式 */
.content-binary {
  color: var(--vscode-symbolIcon-colorForeground, #7ab3ef);
  font-size: 80%;
  float: left;
}

/* Key 类型标签 */
.key-detail-type {
  text-transform: capitalize;
  text-align: center;
  width: 32px;
  display: inline-block;
  font-weight: 600;
  color: var(--vscode-foreground);
}

/* 格式选择器 */
.format-selector {
  margin-left: 16px;
  margin-right: 16px;
  width: 130px;
}

.format-selector :deep(.el-input__inner) {
  height: 28px !important;
}

/* 表格样式 */
:deep(.el-table) {
  background-color: var(--vscode-editor-background) !important;
  color: var(--vscode-foreground) !important;
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
}

:deep(.el-table__header-wrapper th) {
  background-color: var(--vscode-editor-background) !important;
  color: var(--vscode-foreground) !important;
  border-bottom-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
}

:deep(.el-table td) {
  background-color: var(--vscode-editor-background) !important;
  color: var(--vscode-foreground) !important;
  border-bottom-color: var(--vscode-panel-border, rgba(128, 128, 128, 0.2)) !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: var(--vscode-list-hoverBackground) !important;
}

/* 树形组件样式 */
:deep(.vjs__tree) {
  font-family: var(--vscode-editor-font-family, var(--vscode-font-family));
}

:deep(.vjs__tree span) {
  color: var(--vscode-foreground);
}

:deep(.vjs__tree .vjs__tree__node) {
  color: var(--vscode-symbolIcon-colorForeground);
}

:deep(.vjs__tree .vjs__tree__node:hover) {
  color: var(--vscode-textLink-foreground);
}

/* 对话框样式 */
:deep(.el-dialog) {
  background-color: var(--vscode-editor-background) !important;
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
}

:deep(.el-dialog__title) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
}

/* 折叠容器 */
.collapse-container {
  height: 27px;
}

.collapse-container .collapse-btn {
  float: right;
  padding: 9px 0;
}

.formater-binary {
  padding-left: 5px;
  color: var(--vscode-symbolIcon-colorForeground, #7ab3ef);
  font-size: 80%;
}
</style>
