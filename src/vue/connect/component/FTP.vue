<template>
  <div>
    <div class="inline-block mb-2 mr-10">
      <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.encoding') }}</label>
      <input class="w-64 field__input" placeholder="UTF8" required v-model="connectionOption.encoding" />
    </div>
    <div class="block mb-2 mr-10">
      <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.showHiddenFile') }}</label>
      <el-switch v-model="connectionOption.showHidden"></el-switch>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
};
</script>

<style scoped>
/* FTP 组件样式 - 使用 VS Code 主题变量 */
:deep(.el-switch__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-switch__core) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}
</style>
