<template>
  <div id="app">
    <el-form @submit.prevent>
      <el-form-item>
        <!-- content textarea -->
        <el-input ref="cliContent" type="textarea" v-model="content" rows='22' :disabled="true" style="border-bottom: 1px solid #E5E5E5;" id='cli-content'>
        </el-input>
        <!-- input params -->
        <el-autocomplete class="input-suggestion" autocomplete="off" v-model="params" :fetch-suggestions="inputSuggestion" :placeholder="'Press Enter To Exec Commands, Up and Down To Switch History'" :select-when-unmatched="false" :trigger-on-focus="false" popper-class="cli-console-suggestion" @keypress.enter="consoleExec" ref="cliParams" @keyup.up="searchUp" @keyup.down="searchDown">
        </el-autocomplete>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getVscodeEvent } from "../util/vscode";
let vscodeEvent;
export default {
  data() {
    return {
      params: "",
      content: "",
      historyIndex: 0,
      multiClient: null,
      histories:[],
      inputSuggestionItems: [
        "DEL ",
        "KEYS ",
        "TTL ",
        "PING ",
        "EXISTS ",
        // stirng
        "SET ",
        "SETNX ",
        "GET ",
        "STRLEN ",
        "INCR ",
        "DECR ",
        // hash
        "HKEYS ",
        "HDEL ",
        "HMSET ",
        "HGETALL ",
        // list
        "LPUSH ",
        "LINDEX ",
        "LLEN ",
        "LREM ",
        "RPOP ",
        "LPOP ",
        "LSET ",
        // set
        "SADD ",
        "SDIFF ",
        "SMEMBERS ",
        "SPOP ",
        // sorted set
        "ZADD ",
        // trans
        "MULTI ",
        "EXEC ",
      ],
    };
  },
  mounted() {
    vscodeEvent = getVscodeEvent();
    vscodeEvent
      .on("config", (config) => {
        this.initCliContent(config);
      })
      .on("result", (reply) => {
        this.content += this.resolveResult(reply);
      });
    vscodeEvent.emit("route-" + this.$route.name);
  },
  unmounted() {
    vscodeEvent.destroy();
  },
  methods: {
    initCliContent(redisConfig) {
      this.$refs.cliParams.focus();
      this.content += `> ${redisConfig.host}@${redisConfig.port} connected!\n`;
      this.scrollToBottom();
    },
    inputSuggestion(input, cb) {
      if (!this.params) {
        cb([]);
        return;
      }

      const items = this.inputSuggestionItems.filter((item) => {
        return item.toLowerCase().indexOf(input.toLowerCase()) !== -1;
      });

      const suggestions = [...new Set(items)].map((item) => {
        return { value: item };
      });

      cb(suggestions);
    },
    consoleExec() {
      const params = this.params.replace(/^\s+|\s+$/g, "");
      // const paramsArr = splitargs(params);
      const paramsArr = null;

      this.params = "";
      this.content += `> ${params}\n`;

      // append to history command
      this.appendToHistory(params);

      if (params == "exit" || params == "quit") {
        vscodeEvent.emit("ext");
        return;
      }

      if (params == "clear") {
        this.content = "";
        return;
      }

      vscodeEvent.emit("exec", params);
    },
    execFinished(params) {
      const operate = params[0];

      if (operate === "select" && !isNaN(params[1])) {
        vscodeEvent.emit("changeDb", { db: params[1] });
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const textarea = this.$refs.cliContent.$el.firstChild;
        textarea.scrollTop = textarea.scrollHeight;
      });
    },
    appendToHistory(params) {
      if (!params || !params.length) {
        return;
      }

      const items = this.histories;

      if (items[items.length - 1] !== params) {
        items.push(params);
      }

      this.histories = items;
      this.historyIndex = items.length;
    },
    resolveResult(result) {
      let append = "";

      if (result === null) {
        append = `${null}\n`;
      } else if (typeof result === "object") {
        const isArray = !isNaN(result.length);

        for (const i in result) {
          if (typeof result[i] === "object") {
            // fix ioredis pipline result such as [[null, "v1"], [null, "v2"]]
            // null is the result, and v1 is the value
            if (result[i][0] === null) {
              append += this.resolveResult(result[i][1]);
            } else {
              append += this.resolveResult(result[i]);
            }
          } else {
            append += `${(isArray ? "" : `${i}\n`) + result[i]}\n`;
          }
        }
      } else {
        append = `${result}\n`;
      }

      return append;
    },
    searchUp() {
      if (this.suggesttionShowing()) {
        return;
      }

      --this.historyIndex < 0 && (this.historyIndex = 0);

      if (!this.histories[this.historyIndex]) {
        this.params = "";
        return;
      }

      this.params = this.histories[this.historyIndex];
    },
    searchDown() {
      if (this.suggesttionShowing()) {
        return;
      }

      if (++this.historyIndex > this.histories.length) {
        this.historyIndex = this.histories.length;
      }

      if (!this.histories[this.historyIndex]) {
        this.params = "";
        return;
      }

      this.params = this.histories[this.historyIndex];
    },
    suggesttionShowing() {
      const ele = document.querySelector(".cli-console-suggestion");

      if (ele && ele.style.display != "none") {
        return true;
      }

      return false;
    },
  },
};
</script>

<style scoped>
/* L8: body styles moved to non-scoped block below since body doesn't carry scoped attributes */
.cli-dailog .el-dialog__body {
  padding: 0 20px;
}

.input-suggestion {
  width: 100%;
  line-height: 34px !important;
}

/* 输入建议框 - 终端样式 */
.input-suggestion :deep(.el-input__inner) {
  color: var(--vscode-foreground) !important;
  background: var(--vscode-terminal-background, var(--vscode-input-background)) !important;
  border-top: 0 !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  border-radius: 0 0 4px 4px !important;
  font-family: var(--vscode-editor-font-family, monospace) !important;
}

.input-suggestion :deep(.el-input__inner::-webkit-input-placeholder) {
  color: var(--vscode-input-placeholderForeground) !important;
}

/* CLI 内容区 - 终端样式 */
#cli-content {
  color: var(--vscode-foreground) !important;
  background: var(--vscode-terminal-background, var(--vscode-input-background)) !important;
  border: 1px solid var(--vscode-panel-border, var(--vscode-dropdown-border)) !important;
  border-bottom: 0 !important;
  border-radius: 4px 4px 0 0 !important;
  cursor: text !important;
  font-family: var(--vscode-editor-font-family, monospace) !important;
}

#cli-content :deep(.el-textarea__inner) {
  background-color: transparent !important;
  color: var(--vscode-foreground) !important;
  border: none !important;
}
</style>

<style>
/* body 样式 - 终端页面使用终端背景 */
body {
  padding: 0;
  margin-left: 1px;
  background-color: var(--vscode-terminal-background, var(--vscode-editor-background)) !important;
  font-family: var(--vscode-font-family, var(--vscode-editor-font-family)) !important;
}
</style>
