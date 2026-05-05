<template>
  <div>
    <div class="design-toolbar">
      <el-button @click="index.visible=true" type="primary" :title="t('common.add')" icon="el-icon-circle-plus-outline" size="small" circle> </el-button>
    </div>
    <ux-grid :data="designData.editIndex" stripe style="width: 100%" :cell-style="{height: '35px'}">
      <ux-table-column align="center" field="index_name" :title="t('design.indexName')" show-overflow-tooltip="true"></ux-table-column>
      <ux-table-column align="center" field="column_name" :title="t('design.column')" show-overflow-tooltip="true"></ux-table-column>
      <ux-table-column align="center" field="non_unique" :title="t('design.nonUnique')" show-overflow-tooltip="true"></ux-table-column>
      <ux-table-column align="center" field="index_type" :title="t('design.indexType')" show-overflow-tooltip="true"></ux-table-column>
      <ux-table-column :title="t('common.edit')" width="120">
        <template v-slot="{ row }">
          <el-button @click="deleteConfirm(row)" :title="t('common.delete')" type="danger" size="small" icon="el-icon-delete" circle> </el-button>
        </template>
      </ux-table-column>
    </ux-grid>
    <el-dialog :title="t('design.addIndex')" v-model="index.visible" top="3vh">
      <el-form :inline='true'>
        <el-form-item :label="t('design.column')">
          <el-select v-model="index.column">
            <el-option :label="column.name" :value="column.name" :key="column.name" v-for="column in designData.columnList"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('design.indexType')">
          <el-select v-model="index.type">
            <el-option :label="'UNIQUE'" value="UNIQUE"></el-option>
            <el-option :label="'INDEX'" value="INDEX"></el-option>
            <el-option :label="'PRIMARY KEY'" value="PRIMARY KEY"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" :loading="index.loading" @click="createIndex">{{ t('common.add') }}</el-button>
          <el-button @click="index.visible=false">{{ t('common.cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { wrapByDb } from "@/common/wrapper";
import { inject } from "../mixin/vscodeInject";
export default {
  mixins: [inject],
  data() {
    return {
      designData: { indexs: [], table: null, dbType: null, columnList: [] },
      index: {
        visible: false,
        loading: false,
        column: null,
        type: null,
      },
    };
  },
  mounted() {
    this.on("design-data", (data) => {
      this.designData = data;
      this.designData.editIndex = [...this.designData.indexs];
    })
      .on("success", () => {
        this.index.loading = false;
        this.index.visible = false;
        this.init();
      })
      .on("error", (msg) => {
        this.$message.error(msg);
      })
      .init();
  },
  methods: {
    createIndex() {
      this.index.loading = true;
      this.emit("createIndex", {
        column: this.index.column,
        type: this.index.type,
        indexType: this.index.indexType,
      });
    },
    deleteConfirm(row) {
      this.$confirm(this.t('common.confirmDeleteIndex'), this.t('common.warning'), {
        confirmButtonText: this.t('common.ok'),
        cancelButtonText: this.t('common.cancel'),
        type: "warning",
      }).then(() => {
        this.emit("dropIndex",row.index_name)
      });
    },
    execute(sql) {
      if (!sql) return;
      this.emit("execute", sql);
    },
  },
};
</script>

<style>
</style>