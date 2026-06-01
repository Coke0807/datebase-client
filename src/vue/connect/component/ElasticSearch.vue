<template>
  <div class="mt-5">
    <section class="mb-2">
      <div class="inline-block mr-10">
        <label class="inline-block w-32 mr-5 font-bold">
          <span>{{ t('connect.url') }}</span>
          <span class="mr-1 text-red-600" title="required">*</span>
        </label>
        <input
          class="field__input"
          style="width: 28rem"
          :placeholder="t('connect.esHostPlaceholder')"
          required
          v-model="connectionOption.host"
        />
      </div>
    </section>
    <section class="mb-2">
      <label class="inline-block mr-5 font-bold w-36">{{ t('connect.basicAuthOptional') }}</label>
      <div class="inline-flex items-center">
        <el-radio v-model="connectionOption.esAuth" label="none">{{ t('connect.notAuth') }}</el-radio>
        <el-radio v-model="connectionOption.esAuth" label="account">{{ t('connect.account') }}</el-radio>
        <el-radio v-model="connectionOption.esAuth" label="token">{{ t('connect.token') }}</el-radio>
      </div>
    </section>
    <section v-if="connectionOption.esAuth == 'account'">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.username') }}</label>
        <input class="w-64 field__input" :placeholder="t('connect.username')" required v-model="connectionOption.user" />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.password') }}</label>
        <input class="w-64 field__input" :placeholder="t('connect.password')" type="password" v-model="connectionOption.password" />
      </div>
    </section>
    <section class="inline-block mb-2 mr-10" v-if="connectionOption.esAuth == 'token'">
      <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.token') }}</label>
      <input
        class="field__input"
        style="width: 40rem"
        :placeholder="t('connect.tokenPlaceholder')"
        required
        v-model="connectionOption.esToken"
      />
    </section>
    <div class="inline-block mb-2 mr-10">
      <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.connectionTimeout') }}</label>
      <input class="w-64 field__input" placeholder="2000" required v-model="connectionOption.connectTimeout" />
    </div>
  </div>
</template>

<script>
export default {
  inject: ['connectionOption'],
};
</script>

<style scoped>
/* ElasticSearch 组件样式 - 使用 VS Code 主题变量 */
:deep(.el-radio__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}
</style>
