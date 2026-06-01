<template>
  <el-tooltip class="item" effect="dark" :content="getTip(result.columnList[index],scope.column)" placement="left-start">
    <div>
      <span>
        <span v-if="result.columnList[index]&& (result.columnList[index].nullable != 'YES')" style="color: #f94e4e; position: relative; top: .2em;">
          *
        </span>
        <span class="column-name">
          {{ scope.column.title }}<br />
        </span>
      </span>
      <span class="column-type" v-if="result.columnList[index]">
        {{result.columnList[index].type}}
      </span>
    </div>
  </el-tooltip>
</template>

<script>
export default {
  props: {
    scope: { type: Object, required: true },
    result: { type: Object, required: true },
    index: { type: Number, required: true }
  },
  methods: {
    getTip(column, scopeColumn) {
      if (!column || !column.comment) return scopeColumn.title;
      return column.comment;
    },
  },
};
</script>

<style scoped>
/* 工具提示样式 - 使用 VS Code 主题变量 */
:deep(.el-tooltip__popper) {
  background-color: var(--vscode-editorHoverWidget-background) !important;
  color: var(--vscode-editorHoverWidget-foreground) !important;
  border-color: var(--vscode-editorHoverWidget-border) !important;
}

:deep(.el-tooltip__popper .popper__arrow) {
  border-color: var(--vscode-editorHoverWidget-background) !important;
}

:deep(.el-tooltip__popper .popper__arrow::after) {
  border-color: var(--vscode-editorHoverWidget-background) !important;
}
</style>