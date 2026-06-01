<template>
  <div class="mt-2">
    <el-button @click="init" type="success" :title="t('design.refresh')"  size="small" >{{ t('design.refresh') }} </el-button>
    <el-tag>{{ t('design.table') }}:</el-tag>
    {{table}}
    <ul class="tab">
      <li class="tab__item " :class="{'tab__item--active':activePanel=='column'}" @click="activePanel='column'">{{ t('design.column') }} </li>
      <li class="tab__item " :class="{'tab__item--active':activePanel=='index'}" @click="activePanel='index'">{{ t('design.index') }} </li>
    </ul>
    <div class="mt-2">
      <ColumnPanel v-if="activePanel=='column'" />
      <IndexPanel v-if="activePanel=='index'" />
    </div>
  </div>
</template>

<script>
import { inject } from "../mixin/vscodeInject";
import IndexPanel from "./IndexPanel";
import ColumnPanel from "./ColumnPanel";
export default {
  mixins: [inject],
  components: { IndexPanel, ColumnPanel },
  data() {
    return {
      table: null,
      activePanel: "column",
    };
  },
  mounted() {
    this.on("design-data", (data) => {
      this.table = data.table;
    });
  },
};
</script>

<style scoped>
.design-container {
  padding: 16px;
}

/* 标签页样式 - 与 connect 页面保持一致 */
.tab {
  border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  display: flex;
  padding: 0;
  margin: 16px 0 0 0;
  flex-wrap: wrap;
  gap: 2px;
}

.tab__item {
  list-style: none;
  cursor: pointer;
  font-size: 13px;
  padding: 8px 12px;
  color: var(--vscode-tab-inactiveForeground, var(--vscode-foreground));
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  border-radius: 4px 4px 0 0;
}

.tab__item:hover {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground));
  background-color: var(--vscode-tab-hoverBackground, var(--vscode-list-hoverBackground));
}

.tab__item--active {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground));
  border-bottom-color: var(--vscode-tab-activeBorder, var(--vscode-button-background));
  background-color: var(--vscode-tab-activeBackground, transparent);
  font-weight: 500;
}

/* 标签样式 */
:deep(.el-tag) {
  margin: 0 8px;
}

/* 内容区域 */
.content-panel {
  margin-top: 16px;
  padding: 16px;
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
}
</style>
