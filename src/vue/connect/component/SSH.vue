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
        <el-select v-model="connectionOption.ssh.algorithms.cipher[0]" :placeholder="t('connect.default')">
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
            v-model="connectionOption.ssh.watingTime"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  props: ["connectionOption"],
};
</script>

<style></style>
