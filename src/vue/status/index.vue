<template>
  <div class='status-container'>
    <el-tabs v-model="activePanel" @tab-click="changePannel">
      <el-tab-pane :label="t('status.dashBoard')" name="dashBoard" v-if="info.dbType=='MySQL'">
        <el-row style="height:45vh">
          <el-col :span="24">
            {{ t('status.queries') }}:
            <div id="queries"></div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            {{ t('status.traffic') }}:
            <div id="traffic"></div>
          </el-col>
          <el-col :span="12">
            {{ t('status.serverSessions') }}:
            <div id="sessions"></div>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane :label="t('status.processList')" name="processList">
        <vxe-table :data="process.rows" size='small' :cell-style="{height: '35px'}" style="width: 100%" :height="remainHeight()">
          <vxe-column :field="field.name" :title="field.name" v-for="(field,index) in process.fields" :key="index" align="center" show-overflow="true" />
        </vxe-table>
      </el-tab-pane>
      <el-tab-pane :label="t('status.variableList')" name="variableList" v-if="info.dbType!='SqlServer'">
        <vxe-table :data="variableList.rows" size='small' :cell-style="{height: '35px'}" style="width: 100%" :height="remainHeight()">
          <vxe-column :field="field.name" :title="field.name" v-for="(field,index) in variableList.fields" :key="index" align="center" show-overflow="true" />
        </vxe-table>
      </el-tab-pane>
      <el-tab-pane :label="t('status.statusList')" name="statusList" v-if="info.dbType!='SqlServer'">
        <vxe-table :data="statusList.rows" size='small' :cell-style="{height: '35px'}" style="width: 100%" :height="remainHeight()">
          <vxe-column :field="field.name" :title="field.name" v-for="(field,index) in statusList.fields" :key="index" align="center" show-overflow="true" />
        </vxe-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { Chart } from "g2";
import { inject } from "../mixin/vscodeInject";

export default {
  name: "status",
  mixins: [inject],
  data() {
    return {
      info: {},
      activePanel: "processList",
      process: { fields: [], rows: [] },
      variableList: { fields: [], rows: [] },
      statusList: { fields: [], rows: [] },
      dashBoard: {
        sessions: { data: [], lock: false, chart: null, previous: null },
        queries: { data: [], lock: false, chart: null, previous: null },
        traffic: { data: [], lock: false, chart: null, previous: null },
      },
    };
  },
  mounted() {
    function createChart(id, data) {
      const chart = new Chart({
        container: id,
        autoFit: true,
        height: 300,
      });
      chart.data(data);
      chart.line().position("now*value").color("type").size(2);
      chart.render();
      return chart;
    }

    function loadChart(id, chartOption, data, before) {
      const copy = JSON.parse(JSON.stringify(data));
      if (!chartOption.previous) {
        chartOption.previous = copy;
      }
      chartOption.data.push(...data);
      if (before) {
        before(data, chartOption.previous);
      }
      chartOption.previous = copy;
      if (!chartOption.chart) {
        chartOption.chart = createChart(id, chartOption.data);
      } else {
        if (chartOption.data.length >= data.length * 100) {
          for (let index = 0; index < data.length; index++) {
            chartOption.data.shift();
          }
        }
        chartOption.chart.changeData(chartOption.data);
      }
      chartOption.lock = false;
    }

    this.on("info", (info) => {
      this.info = info;
      this.activePanel =
        this.info.dbType == "MySQL" ? "dashBoard" : "processList";
    })
      .on("processList", (data) => {
        this.process = data;
      })
      .on("variableList", (data) => {
        this.variableList = data;
      })
      .on("statusList", (data) => {
        this.statusList = data;
      })
      .on("dashBoard", (data) => {
        loadChart("sessions", this.dashBoard.sessions, data.sessions);
        loadChart(
          "queries",
          this.dashBoard.queries,
          data.queries,
          (data, previous) => {
            for (let index = 0; index < previous.length; index++) {
              data[index].value = data[index].value - previous[index].value;
            }
          }
        );
        loadChart(
          "traffic",
          this.dashBoard.traffic,
          data.traffic,
          (data, previous) => {
            for (let index = 0; index < previous.length; index++) {
              data[index].value =
                (data[index].value - previous[index].value) / 1000 + "kb";
            }
          }
        );
      })
      .init();
    this.emit("processList").emit("variableList").emit("statusList");
    this.sendLoadDashBoard();
    this.dashBoardTimer = setInterval(() => {
      this.sendLoadDashBoard();
    }, 1000);
  },
  beforeUnmount() {
    if (this.dashBoardTimer) {
      clearInterval(this.dashBoardTimer);
    }
    // Destroy G2 chart instances to prevent memory leaks
    ['sessions', 'queries', 'traffic'].forEach(key => {
      if (this.dashBoard[key]?.chart?.chart) {
        this.dashBoard[key].chart.chart.destroy();
      }
    });
  },
  methods: {
    remainHeight() {
      return window.outerHeight - 150;
    },
    sendLoadDashBoard() {
      if (this.dashBoard.sessions.lock) return;
      this.dashBoard.sessions.lock = true;
      this.emit("dashBoard");
    },
    changePannel() {
      switch (this.activePanel) {
        case "processList":
          this.emit("processList");
          break;
        case "variableList":
          this.emit("variableList");
          break;
        case "statusList":
          this.emit("statusList");
          break;
        case "dashBoard":
          this.sendLoadDashBoard();
          break;
      }
    },
  },
};
</script>

<style scoped>
.status-container {
  padding: 16px;
  font-family: var(--vscode-font-family);
}

/* Tabs 样式优化 */
:deep(.el-tabs__header) {
  margin: 0 0 16px 0 !important;
  border-bottom-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
}

:deep(.el-tabs__item) {
  color: var(--vscode-tab-inactiveForeground, var(--vscode-foreground)) !important;
  font-size: var(--vscode-font-size) !important;
  padding: 0 16px !important;
  height: 36px;
  line-height: 36px;
}

:deep(.el-tabs__item:hover) {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground)) !important;
}

:deep(.el-tabs__item.is-active) {
  color: var(--vscode-tab-activeForeground, var(--vscode-foreground)) !important;
  font-weight: 500;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--vscode-tab-activeBorder, var(--vscode-button-background)) !important;
}

/* 图表容器样式 */
:deep(#queries),
:deep(#traffic),
:deep(#sessions) {
  background-color: var(--vscode-editor-background);
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
  padding: 8px;
}

/* 表格样式 */
:deep(.vxe-table) {
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border));
  border-radius: 4px;
}

:deep(.vxe-header--row) {
  background-color: var(--vscode-editor-background) !important;
}

:deep(.vxe-body--row) {
  background-color: var(--vscode-editor-background) !important;
}

:deep(.vxe-body--row:hover) {
  background-color: var(--vscode-list-hoverBackground) !important;
}
</style>