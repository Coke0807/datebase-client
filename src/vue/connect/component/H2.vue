<template>
  <div class="mt-5">
    <section class="mb-2">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.connectionMode') }}</label>
        <el-select v-model="connectionOption.h2Mode" :placeholder="t('connect.selectMode')" class="w-64">
          <el-option :label="t('connect.tcpServer')" value="tcp"></el-option>
          <el-option :label="t('connect.postgresqlProtocol')" value="pg"></el-option>
        </el-select>
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
    
    <section class="mb-4 p-3 bg-gray-100 rounded">
      <h4 class="font-bold mb-2">{{ t('connect.h2SetupInstructions') }}:</h4>
      <div v-if="connectionOption.h2Mode === 'tcp'" class="text-sm">
        <p class="mb-1">{{ t('connect.startH2TcpServer') }}:</p>
        <code class="block bg-gray-200 p-2 rounded">java -cp h2.jar org.h2.tools.Server -tcp -tcpPort 9092</code>
      </div>
      <div v-else class="text-sm">
        <p class="mb-1">{{ t('connect.startH2PgServer') }}:</p>
        <code class="block bg-gray-200 p-2 rounded">java -cp h2.jar org.h2.tools.Server -pg -pgPort 5435</code>
        <p class="mt-2 text-gray-600">{{ t('connect.pgModeNote') }}</p>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props: ["connectionOption"],
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
      this.connectionOption.h2Mode = 'tcp';
    }
  }
};
</script>

<style></style>
