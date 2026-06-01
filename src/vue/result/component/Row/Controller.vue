<template>
<div>
  <el-popover placement="bottom" title="Select columns to show" width="200" trigger="click" type="primary">
    <el-checkbox-group v-model="toolbar.showColumns">
      <el-checkbox v-for="(column,index) in result.fields" :label="column.name" :key="index">
        {{ column.name }}
      </el-checkbox>
    </el-checkbox-group>
    <template #reference>
      <el-button icon="el-icon-search" circle title="Select columns to show" size="small">
      </el-button>
    </template>
  </el-popover>
</div>
</template>

<script>
export default {
    props: {
      result: { type: Object, required: true },
      toolbar: { type: Object, required: true }
    },
    mounted(){
    }
};
</script>

<style scoped>
/* 复选框组样式 - 使用 VS Code 主题变量 */
:deep(.el-checkbox) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-checkbox__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-checkbox__inner) {
  background-color: var(--vscode-checkbox-background, var(--vscode-input-background)) !important;
  border-color: var(--vscode-checkbox-border, var(--vscode-input-border, rgba(128, 128, 128, 0.35))) !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--vscode-button-background) !important;
  border-color: var(--vscode-button-background) !important;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: var(--vscode-button-background) !important;
}

/* 弹出框样式 */
:deep(.el-popover) {
  background-color: var(--vscode-editor-background) !important;
  border-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-foreground) !important;
}

:deep(.el-popover__title) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-popper .popper__arrow::after) {
  border-color: var(--vscode-dropdown-background) !important;
}
</style>