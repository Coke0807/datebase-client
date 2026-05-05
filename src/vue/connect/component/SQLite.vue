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
  props: ["connectionOption", "sqliteState"],
  methods: {
    install() {
      this.$emit("installSqlite");
    },
  },
};
</script>

<style></style>
