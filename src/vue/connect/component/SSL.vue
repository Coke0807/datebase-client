<template>
  <div>
    <section class="flex items-center mb-2">
      <div class="inline-block mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.caCertificate') }}</label>
        <input class="w-64 field__input" :placeholder="t('connect.sslCaPath')" v-model="connectionOption.caPath" />
      </div>
    </section>
    <section class="flex flex-wrap items-center">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.clientCert') }}</label>
        <input
          class="w-64 field__input"
          :placeholder="t('connect.sslClientCertPath')"
          v-model="connectionOption.clientCertPath"
        />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.clientKey') }}</label>
        <input class="w-64 field__input" :placeholder="t('connect.sslClientKeyPath')" v-model="connectionOption.clientKeyPath" />
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
