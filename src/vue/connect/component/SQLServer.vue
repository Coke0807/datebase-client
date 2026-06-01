<template>
  <div>
    <section class="flex items-start mb-2" v-if="connectionOption.dbType == 'SqlServer'">
      <div class="flex items-center flex-1">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.instanceName') }}</label>
        <input
          class="sqlsrv-field__input field__input"
          :placeholder="t('connect.instanceNamePlaceholder')"
          :title="t('connect.instanceNameTitle')"
          v-model="connectionOption.instanceName"
        />
      </div>
      <div class="flex items-center flex-1">
        <span class="text-sm">({{ t('connect.instanceNote') }})</span>
      </div>
    </section>

    <section class="flex items-start mb-2" v-if="connectionOption.dbType == 'SqlServer'">
      <div class="flex items-center flex-1" v-if="connectionOption.dbType == 'SqlServer'">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.authType') }}</label>
        <el-select class="sqlsrv-field__select" v-model="connectionOption.authType" :teleported="false">
          <el-option :label="'default'" value="default"></el-option>
          <el-option :label="'ntlm(' + t('connect.windowsAuth') + ')'" value="ntlm"></el-option>
        </el-select>
      </div>
      <div class="flex items-center flex-1">
        <label class="inline-block mr-5 font-bold w-18">{{ t('connect.encrypt') }}</label>
        <el-switch v-model="connectionOption.encrypt"></el-switch>
      </div>
    </section>

    <section class="flex items-start mb-2" v-if="connectionOption.dbType == 'SqlServer' && connectionOption.authType == 'ntlm'">
      <div class="flex items-center flex-1">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.domain') }}
          <span class="mr-1 text-red-600">*</span>
        </label>
        <input class="sqlsrv-field__input field__input" :placeholder="t('connect.domain')" v-model="connectionOption.domain" />
      </div>
      <div class="flex-1"></div>
    </section>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
};
</script>

<style scoped>
/* SQLServer 组件样式 - 统一输入框和下拉框宽度，消除间隙 */

/* 输入框统一宽度 */
.sqlsrv-field__input {
  width: 256px;
  min-width: 256px;
  max-width: 256px;
}

/* 下拉框容器 - 完全对齐输入框 */
.sqlsrv-field__select {
  width: 256px;
  min-width: 256px;
  max-width: 256px;
}

/* 下拉框内部输入框 */
.sqlsrv-field__select :deep(.el-input) {
  width: 100% !important;
}

.sqlsrv-field__select :deep(.el-input__inner) {
  width: 100% !important;
  height: 28px !important;
  line-height: 28px !important;
  padding: 0 10px !important;
  margin: 0 !important;
}

/* 【关键】消除下拉框与上方元素的间隙 */
.sqlsrv-field__select :deep(.el-input__wrapper) {
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
  background-color: var(--vscode-input-background) !important;
  border: 1px solid var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  border-radius: 2px !important;
}

/* 下拉框聚焦状态 */
.sqlsrv-field__select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--vscode-focusBorder, var(--vscode-button-background)) !important;
}

/* 下拉框选择器本体 - 完全对齐 */
:deep(.el-select) {
  width: 256px;
}

/* 下拉选择器输入框 - 强制覆盖所有状态 */
:deep(.el-select .el-input .el-input__inner) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-input-foreground) !important;
  height: 28px !important;
  line-height: 28px !important;
}

:deep(.el-select .el-input .el-input__inner:focus) {
  border-color: var(--vscode-focusBorder, var(--vscode-button-background)) !important;
}

:deep(.el-select .el-input .el-input__inner::placeholder) {
  color: var(--vscode-input-placeholderForeground) !important;
}

/* 下拉菜单弹出层 */
:deep(.el-select-dropdown) {
  background-color: var(--vscode-dropdown-background) !important;
  border-color: var(--vscode-dropdown-border) !important;
}

:deep(.el-select-dropdown__item) {
  color: var(--vscode-dropdown-foreground) !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: var(--vscode-list-hoverBackground) !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: var(--vscode-button-background) !important;
  font-weight: 600;
}

/* 开关 */
:deep(.el-switch__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-switch__core) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}

/* 文本样式 */
.text-sm {
  font-size: 13px;
  color: var(--vscode-foreground);
}
</style>
