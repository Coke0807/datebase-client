<template>
  <div class="mt-5">
    <section class="mb-2">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.connectionMode') }}</label>
        <el-select v-model="connectionOption.h2Mode" :placeholder="t('connect.selectMode')" class="w-64 h2-mode-select" :teleported="false" popper-class="h2-mode-select-popper">
          <el-option :label="t('connect.tcpServer')" value="tcp"></el-option>
          <el-option :label="t('connect.postgresqlProtocol')" value="pg"></el-option>
        </el-select>
      </div>
    </section>
    
    <section class="mb-2">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.host') }}
          <span class="mr-1 text-red-600">*</span>
        </label>
        <input class="w-64 field__input" placeholder="127.0.0.1"
          v-model="connectionOption.host" />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.username') }}
        </label>
        <input class="w-64 field__input" placeholder="sa"
          v-model="connectionOption.user" />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.password') }}
        </label>
        <input class="w-64 field__input" type="password"
          v-model="connectionOption.password" />
      </div>
    </section>
    
    <section class="mb-2" v-if="connectionOption.h2Mode === 'tcp'">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.port') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input
          class="w-64 field__input"
          placeholder="9092"
          type="number"
          v-model="connectionOption.port"
        />
      </div>
    </section>
    
    <section class="mb-2" v-if="connectionOption.h2Mode === 'pg'">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          {{ t('connect.port') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input
          class="w-64 field__input"
          placeholder="5435"
          type="number"
          v-model="connectionOption.port"
        />
      </div>
    </section>
    
    <section class="mb-2">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.databasePath') }}</label>
        <input
          class="w-64 field__input"
          :placeholder="t('connect.databasePathPlaceholder')"
          v-model="connectionOption.database"
        />
      </div>
    </section>
    
    <section class="mb-4 p-3 info-panel">
      <h4 class="font-bold mb-2">{{ t('connect.h2SetupInstructions') }}:</h4>
      <div v-if="connectionOption.h2Mode === 'tcp'" class="text-sm">
        <p class="mb-1">{{ t('connect.startH2TcpServer') }}:</p>
        <code class="block code-block p-2 rounded">java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092</code>
        <p class="mt-2 warning-text">⚠ {{ t('connect.h2TcpNotSupported') }}</p>
      </div>
      <div v-else class="text-sm">
        <p class="mb-1">{{ t('connect.springBootConfig') }}:</p>
        <code class="block code-block p-2 rounded whitespace-pre">spring.h2.console.enabled=true
spring.datasource.url=jdbc:h2:tcp://localhost/~/test;MODE=PostgreSQL
spring.h2.console.settings.web-allow-others=true</code>
        <p class="mt-2 mb-1 description-text">{{ t('connect.h2PgStandalone') }}:</p>
        <code class="block code-block p-2 rounded">java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435</code>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
  watch: {
    "connectionOption.h2Mode"(value) {
      if (value === 'tcp') {
        this.connectionOption.port = 9092;
      } else if (value === 'pg') {
        this.connectionOption.port = 5435;
      }
    }
  },
  created() {
    if (!this.connectionOption.h2Mode) {
      this.connectionOption.h2Mode = 'pg';
    }
  }
};
</script>

<style scoped>
/* H2 组件样式 - 使用 VS Code 主题变量 */
:deep(.el-select) {
  width: 256px;
}

/* 下拉选择器输入框 - 强制覆盖所有状态 */
:deep(.el-select .el-input .el-input__inner),
:deep(.el-select .el-input__inner) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-input-foreground) !important;
  height: 28px !important;
  line-height: 28px !important;
}

/* 悬停状态 */
:deep(.el-select .el-input .el-input__inner:hover),
:deep(.el-select .el-input__inner:hover) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-focusBorder, var(--vscode-button-background)) !important;
  color: var(--vscode-input-foreground) !important;
}

/* 聚焦状态 */
:deep(.el-select .el-input .el-input__inner:focus),
:deep(.el-select .el-input__inner:focus) {
  border-color: var(--vscode-focusBorder, var(--vscode-button-background)) !important;
  background-color: var(--vscode-input-background) !important;
  color: var(--vscode-input-foreground) !important;
}

/* is-focus 状态 - 下拉框打开时 */
:deep(.el-select .el-input.is-focus .el-input__inner) {
  border-color: var(--vscode-focusBorder, var(--vscode-button-background)) !important;
  background-color: var(--vscode-input-background) !important;
  color: var(--vscode-input-foreground) !important;
}

/* placeholder */
:deep(.el-select .el-input .el-input__inner::placeholder),
:deep(.el-select .el-input__inner::placeholder) {
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

/* 信息面板 - 使用 VS Code 主题背景 */
.info-panel {
  background-color: var(--vscode-textBlockQuote-background, var(--vscode-editor-inactiveSelectionBackground, rgba(128, 128, 128, 0.1)));
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
  color: var(--vscode-foreground);
}

.info-panel h4 {
  color: var(--vscode-foreground);
  margin-top: 0;
}

/* 代码块样式 */
.code-block {
  background-color: var(--vscode-textCodeBlock-background, var(--vscode-editor-background));
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  color: var(--vscode-textCodeBlock-foreground, var(--vscode-foreground));
  font-family: var(--vscode-editor-font-family, monospace);
  font-size: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 警告文本 */
.warning-text {
  color: var(--vscode-errorForeground, #f14c4c);
}

/* 描述文本 */
.description-text {
  color: var(--vscode-descriptionForeground, var(--vscode-foreground));
  opacity: 0.8;
}

/* 文本样式 */
.text-sm {
  font-size: 13px;
  line-height: 1.5;
}

p {
  color: var(--vscode-foreground);
  margin: 0 0 8px 0;
}
</style>

<style>
/* 全局样式 - 强制覆盖 Element Plus 下拉菜单
   这个 style 标签没有 scoped 属性，作用于全局 */
.h2-mode-select .el-input__inner {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, rgba(128, 128, 128, 0.35)) !important;
  color: var(--vscode-input-foreground) !important;
}

.h2-mode-select-popper.el-select-dropdown,
.h2-mode-select-popper .el-select-dropdown__list,
.h2-mode-select-popper .el-scrollbar__view {
  background-color: var(--vscode-dropdown-background, var(--vscode-editor-background)) !important;
}

.h2-mode-select-popper .el-select-dropdown__item {
  color: var(--vscode-dropdown-foreground, var(--vscode-foreground)) !important;
}

.h2-mode-select-popper .el-select-dropdown__item.hover,
.h2-mode-select-popper .el-select-dropdown__item:hover {
  background-color: var(--vscode-list-hoverBackground, rgba(128, 128, 128, 0.15)) !important;
}

.h2-mode-select-popper .el-select-dropdown__item.selected {
  color: var(--vscode-button-background, #409EFF) !important;
}
</style>
