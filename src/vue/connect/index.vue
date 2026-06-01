<template>
  <form @submit.prevent="tryConnect" class="flex flex-col mx-auto connect-container">
    <h1 class="py-4 text-2xl">{{ t('connect.title') }}</h1>

    <blockquote class="p-3 mb-2 panel error" v-if="connect.error">
      <section class="panel__text">
        <div class="inline-block w-32 mr-5 font-bold">{{ t('connect.error') }}</div>
        <span>{{ connect.errorMessage }}</span>
      </section>
    </blockquote>

    <blockquote class="p-3 mb-2 panel success" v-if="connect.success">
      <section class="panel__text">
        <div class="inline-block mr-5 font-bold w-36">{{ t('connect.success') }}</div>
        <span>
          {{ connect.successMessage }}
        </span>
      </section>
    </blockquote>

    <section class="flex flex-wrap items-center">
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block mr-5 font-bold">{{ t('connect.connectionName') }}</label>
        <input
          class="field__input"
          style="min-width: 400px"
          :placeholder="t('connect.connectionName')"
          v-model="connectionOption.name"
        />
      </div>
      <div class="inline-block mb-2 mr-10">
        <label class="inline-block mr-5 font-bold">{{ t('connect.connectionTarget') }}</label>
        <div class="inline-flex items-center">
          <el-radio v-model="connectionOption.global" :label="true"> {{ t('connect.global') }} </el-radio>
          <el-radio v-model="connectionOption.global" :label="false"> {{ t('connect.currentWorkspace') }} </el-radio>
        </div>
      </div>
    </section>

    <section class="mt-5">
      <label class="block font-bold">{{ t('connect.databaseType') }}</label>
      <ul class="flex-wrap tab">
        <li
          class="tab__item"
          :class="{ 'tab__item--active': supportDatabase == connectionOption.dbType }"
          v-for="supportDatabase in supportDatabases"
          :key="supportDatabase"
          @click="connectionOption.dbType = supportDatabase"
        >
          {{ supportDatabase }}
        </li>
      </ul>
    </section>

    <ElasticSearch v-if="connectionOption.dbType == 'ElasticSearch'" :connectionOption="connectionOption" />
    <SQLite
      v-else-if="connectionOption.dbType == 'SQLite'"
      :connectionOption="connectionOption"
      :sqliteState="sqliteState"
      @choose="choose('sqlite')"
      @install="installSqlite"
    />
    <SSH
      v-else-if="connectionOption.dbType == 'SSH'"
      :connectionOption="connectionOption"
      @choose="choose('privateKey')"
    />
    <H2
      v-else-if="connectionOption.dbType == 'H2'"
      :connectionOption="connectionOption"
    />

    <template v-else>
      <section class="mt-5">
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">
            <span>{{ t('connect.host') }}</span>
            <span class="mr-1 text-red-600" :title="t('connect.required')">*</span>
          </label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.host')"
            required
            v-model="connectionOption.host"
          />
        </div>
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">
            {{ t('connect.port') }}
            <span class="mr-1 text-red-600" :title="t('connect.required')">*</span>
          </label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.port')"
            required
            type="number"
            v-model="connectionOption.port"
          />
        </div>
      </section>

      <SQLServer :connectionOption="connectionOption" v-if="connectionOption.dbType == 'SQL Server'" />

      <section>
        <div class="inline-block mb-2 mr-10" v-if="connectionOption.dbType != 'Redis'">
          <label class="inline-block w-32 mr-5 font-bold">
            {{ t('connect.username') }}
            <span class="mr-1 text-red-600" :title="t('connect.required')">*</span>
          </label>
          <input class="w-64 field__input" :placeholder="t('connect.username')" required v-model="connectionOption.user" />
        </div>
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.password') }}</label>
          <input class="w-64 field__input" :placeholder="t('connect.password')" type="password" v-model="connectionOption.password" />
        </div>
      </section>

      <section v-if="connectionOption.dbType != 'FTP' && connectionOption.dbType != 'MongoDB'">
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.databases') }}</label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.specialConnectionDatabase')"
            v-model="connectionOption.database"
          />
        </div>
        <div class="inline-block mb-2 mr-10" v-if="connectionOption.dbType != 'Redis'">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.includeDatabases') }}</label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.includeDatabasesPlaceholder')"
            v-model="connectionOption.includeDatabases"
          />
        </div>
      </section>

      <FTP v-if="connectionOption.dbType == 'FTP'" :connectionOption="connectionOption" />

      <section>
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.connectionTimeout') }}</label>
          <input class="w-64 field__input" :placeholder="t('connect.connectionTimeoutPlaceholder')" v-model="connectionOption.connectTimeout" />
        </div>
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.requestTimeout') }}</label>
          <input
            class="w-64 field__input"
            :placeholder="t('connect.requestTimeoutPlaceholder')"
            type="number"
            v-model="connectionOption.requestTimeout"
          />
        </div>
      </section>

      <section class="flex items-center mb-2" v-if="connectionOption.dbType == 'MySQL'">
        <div class="inline-block mb-2 mr-10">
          <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.timezone') }}</label>
          <input class="w-64 field__input" :placeholder="t('connect.timezonePlaceholder')" v-model="connectionOption.timezone" />
        </div>
      </section>
    </template>

    <section class="switch-section flex flex-wrap items-center">
      <div
        class="switch-item inline-block mb-2 mr-10"
        v-if="connectionOption.dbType != 'SSH' && connectionOption.dbType != 'SQLite'"
      >
        <label class="mr-2 font-bold">{{ t('connect.sshTunnel') }}</label>
        <el-switch v-model="connectionOption.usingSSH"></el-switch>
      </div>
      <div
        class="switch-item inline-block mb-2 mr-10"
        v-if="
          connectionOption.dbType == 'MySQL' ||
          connectionOption.dbType == 'PostgreSQL' ||
          connectionOption.dbType == 'MongoDB' ||
          connectionOption.dbType == 'Redis'
        "
      >
        <label class="inline-block mr-5 font-bold w-18">{{ t('connect.useSSL') }}</label>
        <el-switch v-model="connectionOption.useSSL"></el-switch>
      </div>
      <div class="switch-item inline-block mb-2 mr-10" v-if="connectionOption.dbType === 'MongoDB'">
        <label class="inline-block mr-5 font-bold w-18">{{ t('connect.srvRecord') }}</label>
        <el-switch v-model="connectionOption.srv"></el-switch>
      </div>
      <div class="switch-item inline-block mb-2 mr-10" v-if="connectionOption.dbType === 'MongoDB'">
        <label class="inline-block mr-5 font-bold w-18">{{ t('connect.useConnectionString') }}</label>
        <el-switch v-model="connectionOption.useConnectionString"></el-switch>
      </div>
    </section>
    <section class="flex items-center" v-if="connectionOption.useConnectionString">
      <div class="flex w-full mb-2 mr-10">
        <label class="inline-block w-32 mr-5 font-bold">{{ t('connect.connectionString') }}</label>
        <input
          class="w-4/5 field__input"
          :placeholder="t('connect.connectionStringPlaceholder')"
          v-model="connectionOption.connectionUrl"
        />
      </div>
    </section>

    <SSL
      :connectionOption="connectionOption"
      v-if="
        connectionOption.useSSL &&
        ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'ElasticSearch'].includes(connectionOption.dbType)
      "
    />
    <SSH :connectionOption="connectionOption" v-if="connectionOption.usingSSH && connectionOption.dbType != 'SSH'" />

    <div class="mt-2">
      <button class="inline mr-4 button button--primary w-28" type="submit" v-loading="connect.loading">{{ t('connect.testConnection') }}</button>
      <button class="inline button button--primary w-28" @click="close">{{ t('common.close') }}</button>
    </div>
  </form>
</template>

<script>
import ElasticSearch from "./component/ElasticSearch.vue";
import SQLite from "./component/SQLite.vue";
import SQLServer from "./component/SQLServer.vue";
import SSH from "./component/SSH.vue";
import FTP from "./component/FTP.vue";
import SSL from "./component/SSL.vue";
import H2 from "./component/H2.vue";
import { getVscodeEvent } from "../util/vscode";
let vscodeEvent;
export default {
  name: "Connect",
  components: { ElasticSearch, SQLite, SQLServer, SSH, SSL, FTP, H2 },
  provide() {
    return { connectionOption: this.connectionOption };
  },
  data() {
    return {
      connectionOption: {
        host: "127.0.0.1",
        dbPath: "",
        port: "3306",
        user: "root",
        authType: "default",
        password: "",
        encoding: "utf8",
        database: null,
        usingSSH: false,
        showHidden: false,
        includeDatabases: null,
        dbType: "MySQL",
        encrypt: true,
        connectionUrl: "",
        srv: false,
        esAuth: "none",
        global: true,
        key: null,
        // scheme: "http",
        timezone: "+00:00",
        ssh: {
          host: "",
          privateKeyPath: "",
          port: 22,
          username: "root",
          type: "password",
          waitingTime: 5000,
          algorithms: {
            cipher: [],
          },
        },
      },
      sqliteState: false,
      type: "password",
      supportDatabases: [
        "MySQL",
        "PostgreSQL",
        "SqlServer",
        "SQLite",
        "MongoDB",
        "Redis",
        "ElasticSearch",
        "SSH",
        "FTP",
        "Exasol",
        "H2"
      ],
      connect: {
        loading: false,
        success: false,
        successMessage: "",
        error: false,
        errorMessage: "",
      },
      editModel: false,
    };
  },
  mounted() {
    vscodeEvent = getVscodeEvent();
    vscodeEvent
      .on("edit", (node) => {
        this.editModel = true;
        this.connectionOption = node;
      })
      .on("connect", (node) => {
        this.editModel = false;
      })
      .on("choose", ({ event, path }) => {
        switch (event) {
          case "sqlite":
            this.connectionOption.dbPath = path;
            break;
          case "privateKey":
            this.connectionOption.ssh.privateKeyPath = path;
            break;
        }
        this.$forceUpdate();
      })
      .on("sqliteState", (sqliteState) => {
        this.sqliteState = sqliteState;
      })
      .on("error", (err) => {
        this.connect.loading = false;
        this.connect.success = false;
        this.connect.error = true;
        this.connect.errorMessage = err;
      })
      .on("success", (res) => {
        this.connect.loading = false;
        this.connect.error = false;
        this.connect.success = true;
        this.connect.successMessage = res.message;
        this.connectionOption.connectionKey = res.connectionKey;
        this.connectionOption.key = res.key;
        this.connectionOption.isGlobal = this.connectionOption.global;
      });
    vscodeEvent.emit("route-" + this.$route.name);
  },
  unmounted() {
    vscodeEvent.destroy();
  },
  methods: {
    installSqlite() {
      vscodeEvent.emit("installSqlite");
      this.sqliteState = true;
    },
    tryConnect() {
      this.connect.loading = true;
      vscodeEvent.emit("connecting", {
        connectionOption: JSON.parse(JSON.stringify(this.connectionOption)),
      });
    },
    choose(event) {
      let filters = {};
      switch (event) {
        case "sqlite":
          filters["SQLiteDb"] = ["db"];
          break;
        case "privateKey":
          filters["PrivateKey"] = ["key", "cer", "crt", "der", "pub", "pem", "pk"];
          break;
      }
      filters["File"] = ["*"];
      vscodeEvent.emit("choose", {
        event,
        filters,
      });
    },
    close() {
      vscodeEvent.emit("close");
    },
  },
  watch: {
    "connectionOption.dbType"(value) {
      if (this.editModel) {
        return;
      }
      this.connectionOption.host = "127.0.0.1";
      switch (value) {
        case "MySQL":
          this.connectionOption.user = "root";
          this.connectionOption.port = 3306;
          this.connectionOption.database = null;
          break;
        case "PostgreSQL":
          this.connectionOption.user = "postgres";
          this.connectionOption.encrypt = false;
          this.connectionOption.port = 5432;
          this.connectionOption.database = "postgres";
          break;
        case "Oracle":
          this.connectionOption.user = "system";
          this.connectionOption.port = 1521;
          break;
        case "SqlServer":
          this.connectionOption.user = "sa";
          this.connectionOption.encrypt = true;
          this.connectionOption.port = 1433;
          this.connectionOption.database = "master";
          break;
        case "ElasticSearch":
          this.connectionOption.host = "127.0.0.1:9200";
          this.connectionOption.user = null;
          this.connectionOption.port = null;
          this.connectionOption.database = null;
          break;
        case "Redis":
          this.connectionOption.port = 6379;
          this.connectionOption.user = null;
          this.connectionOption.database = "0";
          break;
        case "MongoDB":
          this.connectionOption.user = null;
          this.connectionOption.password = null;
          this.connectionOption.port = 27017;
          break;
        case "FTP":
          this.connectionOption.port = 21;
          this.connectionOption.user = null;
          break;
        case "SSH":
          break;
        case "Exasol":
          this.connectionOption.user = "sys";
          this.connectionOption.port = 8563;
          this.connectionOption.database = null;
          break;
        case "H2":
          this.connectionOption.user = "sa";
          this.connectionOption.password = "";
          this.connectionOption.port = 9092;
          this.connectionOption.database = "test";
          // 修复：H2 切换时确保 h2Mode 有有效值，否则下拉框显示空白
          if (!this.connectionOption.h2Mode) {
            this.connectionOption.h2Mode = "pg";
          }
          break;
      }
      this.$forceUpdate();
    },
    "connectionOption.connectionUrl"(value) {
      try {
        // L12: Use URL constructor for reliable parsing instead of sequential regex
        let rawUrl = this.connectionOption.connectionUrl;
        // Detect SRV protocol (mongodb+srv://)
        const srvMatch = rawUrl.match(/mongodb\+/);
        if (srvMatch) {
          this.connectionOption.srv = true;
          // Normalize to standard mongodb:// for URL parsing
          rawUrl = rawUrl.replace(/\+srv/, '');
        } else {
          this.connectionOption.srv = false;
        }
        const parsed = new URL(rawUrl);
        if (parsed.username) this.connectionOption.user = decodeURIComponent(parsed.username);
        if (parsed.password) this.connectionOption.password = decodeURIComponent(parsed.password);
        if (parsed.hostname) this.connectionOption.host = parsed.hostname;
        if (parsed.port) this.connectionOption.port = parsed.port;
        if (parsed.pathname && parsed.pathname.length > 1) {
          this.connectionOption.database = parsed.pathname.substring(1);
        }
      } catch (e) {
        // Invalid URL — leave fields as-is
      }
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
/* 强制使用 VS Code 主题背景 */
.connect-container {
  width: 100%;
  max-width: 1300px;
  padding: 16px;
  background-color: var(--vscode-editor-background);
  min-height: 100vh;
}

/* 标签页样式 - 类似 VS Code 的 Tab 样式 */
.tab {
  border-bottom: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  display: flex;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
  gap: 2px;
  background-color: var(--vscode-editor-background);
}

.tab__item {
  list-style: none;
  cursor: pointer;
  font-size: 13px;
  padding: 8px 12px;
  color: var(--vscode-tab-inactiveForeground, var(--vscode-foreground)) !important;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  border-radius: 4px 4px 0 0;
  background-color: transparent;
}

.tab__item:hover {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground)) !important;
  background-color: var(--vscode-tab-hoverBackground, var(--vscode-list-hoverBackground));
}

.tab__item--active {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground)) !important;
  border-bottom-color: var(--vscode-tab-activeBorder, var(--vscode-button-background));
  background-color: var(--vscode-tab-activeBackground, transparent);
  font-weight: 500;
}

/* 数字输入框去除箭头 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* 按钮样式 - 与 VS Code 按钮一致 */
.button {
  padding: 6px 16px;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  font-weight: 500;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.2s ease;
  font-size: var(--vscode-font-size);
  height: 28px;
  line-height: 1;
}

.button--primary {
  color: var(--vscode-button-foreground) !important;
  background-color: var(--vscode-button-background) !important;
  border: 1px solid var(--vscode-button-background) !important;
}

.button--primary:hover {
  background-color: var(--vscode-button-hoverBackground, var(--vscode-button-background)) !important;
  border-color: var(--vscode-button-hoverBackground, var(--vscode-button-background)) !important;
}

.button--primary:active {
  background-color: var(--vscode-button-background) !important;
}

.button--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 面板样式 - 用于错误和成功提示 */
.panel {
  border-left-width: 4px;
  border-left-style: solid;
  background: var(--vscode-textBlockQuote-background, var(--vscode-editor-background));
  border-radius: 0 4px 4px 0;
  padding: 12px 16px;
  margin: 8px 0;
}

.error {
  border-color: var(--vscode-inputValidation-errorBorder, #f14c4c);
  background-color: var(--vscode-inputValidation-errorBackground, rgba(241, 76, 76, 0.15));
}

.success {
  border-color: var(--vscode-testing.iconPassed, #4ec9b0);
  background-color: rgba(78, 201, 176, 0.15);
}

.panel__text {
  line-height: 1.6;
  color: var(--vscode-foreground) !important;
}

/* 表单区域样式 */
section {
  margin-bottom: 4px;
  background-color: var(--vscode-editor-background);
}

/* 必填标记样式 */
.text-red-600 {
  color: var(--vscode-errorForeground, #f14c4c) !important;
}

/* 标签样式 - 强制覆盖 */
label {
  color: var(--vscode-foreground) !important;
  font-size: var(--vscode-font-size) !important;
  font-weight: 500;
}

/* 标题样式 */
h1 {
  color: var(--vscode-foreground) !important;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding: 16px 0 12px 0;
  background-color: var(--vscode-editor-background);
}

/* 确保所有文字都使用 VS Code 主题色 */
span, div, p {
  color: var(--vscode-foreground);
}

/* 输入框容器 */
.inline-block {
  background-color: var(--vscode-editor-background);
}

/* 开关区域布局 - 修复错位 */
.switch-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 32px;
  margin-top: 12px;
  margin-bottom: 12px;
  min-height: 32px;
  background-color: var(--vscode-editor-background);
}

.switch-item {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  min-height: 28px;
  background-color: var(--vscode-editor-background);
  line-height: 1;
}

.switch-item label {
  margin-right: 8px;
  margin-bottom: 0;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
}

/* Element Plus 开关样式强制覆盖 */
:deep(.el-switch) {
  display: inline-flex;
  align-items: center;
  height: 22px !important;
  line-height: 22px !important;
  vertical-align: middle;
}

:deep(.el-switch__core) {
  border: 1px solid var(--vscode-checkbox-border, var(--vscode-input-border, rgba(128, 128, 128, 0.35))) !important;
  background-color: var(--vscode-checkbox-background, var(--vscode-input-background)) !important;
  border-radius: 12px !important;
  height: 20px !important;
  width: 38px !important;
  margin: 0 2px !important;
}

:deep(.el-switch__core::after) {
  background-color: var(--vscode-foreground) !important;
  width: 14px !important;
  height: 14px !important;
  top: 2px !important;
  left: 2px !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}

:deep(.el-switch.is-checked .el-switch__core::after) {
  background-color: var(--vscode-button-foreground) !important;
  left: 100% !important;
  transform: translateX(-100%) !important;
  margin-left: -2px !important;
}

/* 单选框样式 */
:deep(.el-radio) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-radio__label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--vscode-button-background) !important;
}
</style>
