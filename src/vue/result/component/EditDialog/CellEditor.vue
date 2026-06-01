<template>
  <div>
    <template v-if="type=='date'">
      <el-date-picker value-format="yyyy-MM-dd" :value="value" @input="sync"></el-date-picker>
    </template>
    <template v-else-if="type=='time'">
      <el-time-picker value-format="HH:mm:ss" :value="value" @input="sync"></el-time-picker>
    </template>
    <template v-else-if="isDateTime(type)">
      <el-date-picker value-format="yyyy-MM-dd HH:mm:ss" type="datetime" :value="value" @input="sync"></el-date-picker>
    </template>
    <el-input v-else :value="value" @input="sync"></el-input>
  </div>
</template>

<script>
export default {
  props: {
    type: { type: String, required: true },
    value: { type: [String, Number], default: null }
  },
  methods: {
    isDateTime(type){
      if(!type)return false;
      type=type.toUpperCase()
      return type=='DATETIME' || type=='TIMESTAMP' || type=='TIMESTAMP WITHOUT TIME ZONE' ||type=='TIMESTAMP WITH TIME ZONE'
    },
    sync(value) {
      // console.log(value)
      this.$emit("input", value)
    },
  },
}
</script>

<style scoped>
.el-icon-time {
  line-height: 35px;
}

.el-date-editor {
  width: 100% !important;
}
.el-date-editor input {
  text-align: center;
}

/* 日期/时间选择器样式 - 使用 VS Code 主题变量 */
:deep(.el-input__inner) {
  background-color: var(--vscode-input-background) !important;
  border-color: var(--vscode-input-border, var(--vscode-dropdown-border)) !important;
  color: var(--vscode-input-foreground) !important;
}

/* 日期/时间面板弹出层 */
:deep(.el-picker-panel) {
  background-color: var(--vscode-dropdown-background, var(--vscode-editor-background)) !important;
  border-color: var(--vscode-dropdown-border, var(--vscode-input-border, rgba(128, 128, 128, 0.35))) !important;
  color: var(--vscode-dropdown-foreground, var(--vscode-foreground)) !important;
}

:deep(.el-date-picker__header-label) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-picker-panel__icon-btn) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-date-table th) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-date-table td span) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-date-table td.current span) {
  background-color: var(--vscode-button-background) !important;
  color: var(--vscode-button-foreground) !important;
}

:deep(.el-date-table td.today span) {
  color: var(--vscode-button-background) !important;
}

:deep(.el-date-table td:hover span) {
  background-color: var(--vscode-list-hoverBackground, rgba(128, 128, 128, 0.15)) !important;
}

:deep(.el-year-table td a) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-year-table td.current a) {
  color: var(--vscode-button-background) !important;
}

:deep(.el-month-table td a) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-month-table td.current a) {
  color: var(--vscode-button-background) !important;
}

/* 时间选择器 */
:deep(.el-time-spinner__item) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-time-spinner__item.active) {
  color: var(--vscode-button-background) !important;
}

:deep(.el-time-spinner__item:hover) {
  background-color: var(--vscode-list-hoverBackground, rgba(128, 128, 128, 0.15)) !important;
}

:deep(.el-time-panel__btn) {
  color: var(--vscode-foreground) !important;
}

:deep(.el-time-panel__btn.confirm) {
  color: var(--vscode-button-background) !important;
}
</style>