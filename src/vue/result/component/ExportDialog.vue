<template>
  <el-dialog :title="t('result.exportOption')" :model-value="visible" width="30%" top="3vh" @close="$emit('update:visible',false)">
    <el-form :model="exportOption">
      <el-form-item :label="t('result.exportFileType')">
        <el-select v-model="exportOption.type" :teleported="false">
          <el-option :label="'Xlsx'" value="xlsx"></el-option>
          <el-option :label="'Sql'" value="sql"></el-option>
          <el-option :label="'Json'" value="json"></el-option>
          <el-option :label="'Csv'" value="csv"> </el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="t('result.removeLimit')">
        <el-switch v-model="exportOption.withOutLimit"></el-switch>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="loading=true;$emit('exportHandle',exportOption);">{{ t('result.export') }}</el-button>
        <el-button @click="$emit('update:visible',false)">{{ t('connect.cancel') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: { type: Boolean, required: true }
  },
  data() {
    return {
      loading: false,
      exportOption: {
        withOutLimit: true,
        type: "xlsx",
      },
    }
  },
  watch:{
    visible(){
      this.loading=false;
    }
  }
}
</script>

<style scoped>
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

:deep(.el-dialog__body) {
  color: var(--vscode-foreground) !important;
}

/* 表单样式 */
:deep(.el-form-item__label) {
  color: var(--vscode-foreground) !important;
}

/* 下拉选择器样式 */
:deep(.el-select .el-input__inner) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-input-foreground) !important;
}

:deep(.el-select-dropdown) {
  background-color: var(--vscode-dropdown-background) !important;
  border-color: var(--vscode-dropdown-border) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--vscode-dropdown-foreground) !important;
}

:deep(.el-select-dropdown__item:hover),
:deep(.el-select-dropdown__item.hover) {
  background-color: var(--vscode-list-hoverBackground) !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--vscode-button-background) !important;
}

/* 开关样式 */
:deep(.el-switch__core) {
  border-color: var(--vscode-checkbox-border, var(--vscode-input-border, rgba(128, 128, 128, 0.35))) !important;
  background-color: var(--vscode-checkbox-background, var(--vscode-input-background)) !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}

/* 按钮样式 */
:deep(.el-button--primary) {
  background-color: var(--vscode-button-background) !important;
  border-color: var(--vscode-button-background) !important;
  color: var(--vscode-button-foreground) !important;
}

:deep(.el-button:not(.el-button--primary)) {
  background-color: var(--vscode-button-secondaryBackground, var(--vscode-input-background)) !important;
  border-color: var(--vscode-button-secondaryBackground, var(--vscode-input-border)) !important;
  color: var(--vscode-button-secondaryForeground, var(--vscode-foreground)) !important;
}
</style>