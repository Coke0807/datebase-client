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
        <el-select v-model="connectionOption.authType">
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
  props: ["connectionOption"],
};
</script>

<style></style>
