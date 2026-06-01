<template>
  <div class="mt-5">
    <section>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block font-bold mr-9 w-28">
          {{ t('connect.sshHost') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input class="w-64 field__input" :placeholder="t('connect.sshHost')" required v-model="connectionOption.ssh.host" />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block font-bold mr-9 w-28">
          {{ t('connect.sshPort') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input
          class="w-64 field__input"
          :placeholder="t('connect.sshPort')"
          required
          type="number"
          v-model="connectionOption.ssh.port"
        />
      </div>
    </section>

    <section>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block font-bold mr-9 w-28">
          {{ t('connect.sshUsername') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input class="w-64 field__input" :placeholder="t('connect.sshUsername')" required v-model="connectionOption.ssh.username" />
      </div>

      <div class="inline-block mb-2 mr-10">
        <label class="inline-block font-bold mr-9 w-28">{{ t('connect.sshCipher') }}</label>
        <el-select v-model="connectionOption.ssh.algorithms.cipher[0]" :placeholder="t('connect.default')" :teleported="false">
          <el-option value="aes128-cbc">aes128-cbc</el-option>
          <el-option value="aes192-cbc">aes192-cbc</el-option>
          <el-option value="aes256-cbc">aes256-cbc</el-option>
          <el-option value="3des-cbc">3des-cbc</el-option>
          <el-option value="aes128-ctr">aes128-ctr</el-option>
          <el-option value="aes192-ctr">aes192-ctr</el-option>
          <el-option value="aes256-ctr">aes256-ctr</el-option>
        </el-select>
      </div>
    </section>

    <section v-if="connectionOption.dbType == 'SSH'">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.showHiddenFile') }}</label>
        <el-switch v-model="connectionOption.showHidden"></el-switch>
      </div>
    </section>

    <section class="mb-2">
      <label class="inline-block font-bold mr-9 w-28">{{ t('connect.type') }}</label>
      <el-radio v-model="connectionOption.ssh.type" label="password">{{ t('connect.password') }}</el-radio>
      <el-radio v-model="connectionOption.ssh.type" label="privateKey">{{ t('connect.privateKey') }}</el-radio>
      <el-radio v-model="connectionOption.ssh.type" label="native">{{ t('connect.nativeSSH') }}</el-radio>
    </section>

    <div v-if="connectionOption.ssh.type == 'password'" class="mb-2">
      <section>
        <label class="inline-block font-bold mr-9 w-28">
          {{ t('connect.password') }}
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input
          class="w-64 field__input"
          :placeholder="t('connect.password')"
          required
          type="password"
          v-model="connectionOption.ssh.password"
        />
      </section>
    </div>
    <div v-else class="mb-2">
      <section>
        <div class="inline-block mb-2 mr-8">
          <label class="inline-block font-bold mr-9 w-28">{{ t('connect.privateKeyPath') }}</label>
          <input
            class="w-50 field__input"
            :placeholder="t('connect.privateKeyPath')"
            v-model="connectionOption.ssh.privateKeyPath"
          />
          <button @click="() => $emit('choose')" type="button" class="w-12 ml-1">{{ t('connect.choose') }}</button>
        </div>
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block font-bold mr-9 w-28">{{ t('connect.passphrase') }}</label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.passphrase')"
            type="password"
            v-model="connectionOption.ssh.passphrase"
          />
        </div>
      </section>
      <section v-if="connectionOption.ssh.type == 'native'">
        <div class="inline-block mr-10">
          <label class="inline-block font-bold mr-9 w-28">{{ t('connect.waitingTime') }}</label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.waitingTimeDesc')"
            v-model="connectionOption.ssh.waitingTime"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
};
</script>

<style scoped>
/* SSH 组件样式 - 使用 VS Code 主题变量 */
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

/* 单选框 */
:deep(.el-radio__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
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
