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
  props: ["connectionOption"],
};
</script>

<style></style>
