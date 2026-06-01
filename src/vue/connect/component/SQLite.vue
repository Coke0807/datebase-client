<template>
  <div class="mt-5">
    <section class="mb-2" v-if="!sqliteState">
      <div class="inline-block w-1/4 mr-5 font-bold">
        <el-alert :title="t('connect.sqliteNotInstalled')" type="warning" show-icon />
      </div>
      <div class="inline-block mr-5 font-bold w-36">
        <button class="inline button button--primary w-128" @click="install">{{ t('connect.installSqlite') }}</button>
      </div>
    </section>
    <section class="mb-2">
      <div class="inline-block mr-10">
        <label class="inline-block mr-5 font-bold w-28">{{ t('connect.sqliteFilePath') }}</label>
        <input class="w-80 field__input" :placeholder="t('connect.sqliteFilePath')" v-model="connectionOption.dbPath" />
        <button class="inline button button--primary w-128" type="button" @click="() => $emit('choose')">
          {{ t('connect.chooseDatabaseFile') }}
        </button>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
  props: {
    sqliteState: { type: Boolean, default: false }
  },
  methods: {
    install() {
      this.$emit("installSqlite");
    },
  },
};
</script>

<style scoped>
/* SQLite 组件样式 - 使用 VS Code 主题变量 */
:deep(.el-alert) {
  background-color: var(--vscode-inputValidation-warningBackground, rgba(255, 191, 0, 0.15)) !important;
  border-color: var(--vscode-inputValidation-warningBorder, rgba(255, 191, 0, 0.5)) !important;
  color: var(--vscode-foreground) !important;
  padding: 8px 12px !important;
}

:deep(.el-alert__title) {
  color: var(--vscode-foreground) !important;
  font-size: var(--vscode-font-size) !important;
}

:deep(.el-alert__icon) {
  color: var(--vscode-editorWarning-foreground, #cca700) !important;
}

:deep(.el-alert__closebtn) {
  color: var(--vscode-foreground) !important;
}
</style>
