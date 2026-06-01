<template>
  <div>
    <section class="mb-2" v-if="connectionOption.dbType == 'SqlServer'">
      <div class="inline-block mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.instanceName') }}</label>
        <input
          class="w-64 field__input"
          :placeholder="t('connect.instanceNamePlaceholder')"
          :title="t('connect.instanceNameTitle')"
          v-model="connectionOption.instanceName"
        />
      </div>
      <span> ({{ t('connect.instanceNote') }}) </span>
    </section>

    <section class="mb-2" v-if="connectionOption.dbType == 'SqlServer'">
      <div class="inline-block mr-10" v-if="connectionOption.dbType == 'SqlServer'">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.authType') }}</label>
        <el-select v-model="connectionOption.authType" :teleported="false">
          <el-option :label="'default'" value="default"></el-option>
          <el-option :label="'ntlm(' + t('connect.windowsAuth') + ')'" value="ntlm"></el-option>
        </el-select>
      </div>
      <div class="inline-block mr-10">
        <label class="inline-block mr-5 font-bold w-18">{{ t('connect.encrypt') }}</label>
        <el-switch v-model="connectionOption.encrypt"></el-switch>
      </div>
    </section>

    <section class="mb-2" v-if="connectionOption.dbType == 'SqlServer' && connectionOption.authType == 'ntlm'">
      <div class="inline-block mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.domain') }}
          <span class="mr-1 text-red-600">*</span>
        </label>
        <input class="w-64 field__input" :placeholder="t('connect.domain')" v-model="connectionOption.domain" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
};
</script>

<style scoped>
/* SQLServer 组件样式 - 使用 VS Code 主题变量 */
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
</style>
