<template>
  <div id="app">
    <!-- auto refresh row -->
    <el-row>
      <el-col>
        <div style="float: right;">
          <el-tag type="info">
            <i class="el-icon-refresh"></i>
            {{ t('redis.redisStatus.autoRefresh') }}
          </el-tag>

          <el-tooltip class="item" effect="dark" :content="t('redis.redisStatus.autoRefreshTip')" placement="bottom">
            <el-switch v-model="autoRefresh" @change="refreshInit">
            </el-switch>
          </el-tooltip>
        </div>
      </el-col>
    </el-row>

    <!-- server status row -->
    <el-row :gutter="10" class="status-container status-card">
      <!-- server -->
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <i class="fa fa-server"></i>
              <span>{{ t('redis.redisStatus.server') }}</span>
            </div>
          </template>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              {{ t('redis.redisStatus.redisVersion') }}:
              <span class="server-status-text">{{this.connectionStatus.redis_version}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              {{ t('redis.redisStatus.os') }}:
              <span class="server-status-text" :title="connectionStatus.os">{{this.connectionStatus.os}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              {{ t('redis.redisStatus.processId') }}:
              <span class="server-status-text">{{this.connectionStatus.process_id}}</span>
            </el-tag>
          </p>
        </el-card>
      </el-col>

      <!-- memory row -->
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <i class="fa fa-microchip"></i>
              <span> Memory</span>
            </div>
          </template>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Used Memory:
              <span class="server-status-text">{{this.connectionStatus.used_memory_human}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Used Memory Peak:
              <span class="server-status-text">{{this.connectionStatus.used_memory_peak_human}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Used Memory Lua:
              <span class="server-status-text">{{Math.round(this.connectionStatus.used_memory_lua / 1024)}}K</span>
            </el-tag>
          </p>
        </el-card>
      </el-col>

      <!-- stats row -->
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <i class="fa fa-thermometer-three-quarters"></i>
              <span>Stats</span>
            </div>
          </template>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Connected Clients:
              <span class="server-status-text">{{this.connectionStatus.connected_clients}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Total Connections:
              <span class="server-status-text">{{this.connectionStatus.total_connections_received}}</span>
            </el-tag>
          </p>

          <p class="server-status-tag-p">
            <el-tag class='server-status-container' type="info" size="big">
              Total Commands:
              <span class="server-status-text">{{this.connectionStatus.total_commands_processed}}</span>
            </el-tag>
          </p>
        </el-card>
      </el-col>
    </el-row>

    <!-- key statistics -->
    <el-row class="status-card">
      <el-col>
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <i class="fa fa-bar-chart"></i>
              <span>Key Statistics</span>
            </div>
          </template>

          <el-table :data="DBKeys" stripe>
            <el-table-column fixed prop="db" label="DB">
            </el-table-column>
            <el-table-column sortable prop="keys" label="Keys" :sort-method="sortByKeys">
            </el-table-column>
            <el-table-column sortable prop="expires" label="Expires" :sort-method="sortByExpires">
            </el-table-column>
            <el-table-column sortable prop="avg_ttl" label="Avg TTL" :sort-method="sortByTTL">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- redis all info -->
    <el-row class="status-card">
      <el-col>
        <el-card class="box-card">
          <template #header>
            <div class="clearfix">
              <i class="fa fa-info-circle"></i>
              <span> All Redis Info</span>
            </div>
          </template>

          <el-table :data="AllRedisInfo" stripe>
            <el-table-column fixed prop="key" label="Key">
            </el-table-column>
            <el-table-column prop="value" label="Value">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { getVscodeEvent } from "../util/vscode"
let vscodeEvent
export default {
  data() {
    return {
      autoRefresh: false,
      refreshTimer: null,
      refreshInterval: 2000,
      connectionStatus: {},
      statusConnection: null,
    }
  },
  mounted() {
    vscodeEvent = getVscodeEvent()
    this.refreshInit()
    vscodeEvent.on("info", (info) => {
      this.initStatus(info)
    })
    vscodeEvent.emit("route-" + this.$route.name)
  },
  unmounted() {
    clearInterval(this.refreshTimer)
    vscodeEvent.destroy()
  },
  methods: {
    refreshInit() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
      this.refreshTimer=setInterval(() => {
        if (this.autoRefresh) {
          vscodeEvent.emit("route-" + this.$route.name)
        }
      },2000);
    },
    sortByKeys(a, b) {
      return a.keys - b.keys
    },
    sortByExpires(a, b) {
      return a.expires - b.expires
    },
    sortByTTL(a, b) {
      return a.avg_ttl - b.avg_ttl
    },
    initStatus(content) {
      if (!content) {
        return {}
      }

      content = content.split("\n")
      const lines = {}

      for (let i of content) {
        i = i.replace(/\s/gi, "")
        if (i.startsWith("#") || !i) continue

        const kv = i.split(":")
        lines[kv[0]] = kv[1]
      }

      this.connectionStatus = lines
    },
  },
  computed: {
    DBKeys() {
      const dbs = []

      for (const i in this.connectionStatus) {
        if (i.startsWith("db")) {
          const item = this.connectionStatus[i]
          const array = item.split(",")

          dbs.push({
            db: i,
            keys: array[0].split("=")[1],
            expires: array[1].split("=")[1],
            avg_ttl: array[2].split("=")[1],
          })
        }
      }

      return dbs
    },
    AllRedisInfo() {
      const infos = []

      for (const i in this.connectionStatus) {
        infos.push({ key: i, value: this.connectionStatus[i] })
      }

      return infos
    },
  },
}
</script>

<style scoped>
/* L8: body styles moved to non-scoped block below since body doesn't carry scoped attributes */
.el-row.status-card {
  margin-top: 20px;
}

.server-status-tag-p {
  height: 32px;
}

.server-status-container {
  width: 100%;
  overflow-x: hidden;
  text-overflow: ellipsis;
  background-color: var(--vscode-badge-background) !important;
  border-color: var(--vscode-badge-background) !important;
  color: var(--vscode-badge-foreground) !important;
}

.server-status-text {
  color: var(--vscode-testing.iconPassed, #43b50b);
}

/* 卡片样式 */
:deep(.el-card) {
  background-color: var(--vscode-editor-background) !important;
  border-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-foreground) !important;
}

:deep(.el-card__header) {
  border-bottom-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-foreground) !important;
  background-color: var(--vscode-editor-inactiveSelectionBackground, rgba(128, 128, 128, 0.05)) !important;
}

/* 开关样式 */
:deep(.el-switch__core) {
  border-color: var(--vscode-input-border, rgba(128, 128, 128, 0.35)) !important;
  background-color: var(--vscode-input-background) !important;
}

:deep(.el-switch.is-checked .el-switch__core) {
  border-color: var(--vscode-button-background) !important;
  background-color: var(--vscode-button-background) !important;
}

/* 标签样式 */
:deep(.el-tag) {
  background-color: var(--vscode-badge-background) !important;
  border-color: var(--vscode-badge-background) !important;
  color: var(--vscode-badge-foreground) !important;
}

/* 工具提示 */
:deep(.el-tooltip__popper) {
  background-color: var(--vscode-editorHoverWidget-background) !important;
  color: var(--vscode-editorHoverWidget-foreground) !important;
  border-color: var(--vscode-editorHoverWidget-border) !important;
}
</style>

<style>
/* body 样式 */
body {
  background-color: var(--vscode-editor-background) !important;
  font-family: var(--vscode-font-family) !important;
}
</style>