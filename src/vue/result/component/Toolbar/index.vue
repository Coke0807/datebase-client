<template>
  <div class="toolbar">
    <el-button v-if="showFullBtn" @click="()=>$emit('sendToVscode','full')" type="primary" title="Full Result View" icon="el-icon-rank" size="small" circle>
    </el-button>
    <el-input v-model="searchInput" size="small" placeholder="Input To Search Data" style="width:200px" :clearable="true" />
    <el-button icon="icon-github" title="Star the project to represent support." @click='()=>$emit("sendToVscode", "openGithub")'></el-button>
    <el-button icon="el-icon-circle-plus-outline" @click="$emit('insert')" title="Insert new row"></el-button>
    <el-button icon="el-icon-delete" style="color:#f56c6c" @click="$emit('deleteConfirm');" title="delete"></el-button>
    <el-button icon="el-icon-bottom" @click="$emit('export');" style="color:#4ba3ff;" title="Export"></el-button>
    <el-button icon="el-icon-caret-right" title="Execute Sql" style="color: #54ea54;margin-left:0;" @click="$emit('run');"></el-button>
    <div style="display:inline-block;font-size:14px;padding-left: 8px;" class="el-pagination__total">
      Cost: {{costTime}}ms
    </div>
    <div style="display:inline-block">
      <el-pagination @size-change="changePageSize" @current-change="page=>$emit('changePage',page,true)" @next-click="()=>$emit('changePage',1)" @prev-click="()=>$emit('changePage',-1)" :current-page.sync="page.pageNum" :small="true" :page-size="page.pageSize"  :layout="page.total!=null?'prev,pager, next, total':'prev, next'" :total="page.total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    costTime: { type: Number, default: 0 },
    search: { type: String },
    showFullBtn: { type: Boolean, default: false },
    page: { type: Object, required: true }
  },
  data() {
    return {
      searchInput: null,
    };
  },
  methods: {
    changePageSize(size) {
      this.page.pageSize = size;
      this.$emit("changePageSize", size);
    },
  },
  watch: {
    searchInput: function () {
      this.$emit("update:search", this.searchInput); // 将子组件的输入框的值传递给父组件 父组件需要用.sync
    },
  },
};
</script>

<style scoped>
.toolbar {
  margin-top: 3px;
  margin-bottom: 3px;
}

.el-button--mini.is-circle {
  padding: 6px;
}

.el-button--default {
  padding: 0;
  border: none;
  font-size: 19px;
  margin-left: 7px;
  background-color: transparent !important;
}

.el-button:focus{
  color: var(--vscode-button-foreground) !important;
  background-color: transparent !important;
}

.el-button:hover {
  color: var(--vscode-button-hoverBackground) !important;
  border-color: var(--vscode-button-hoverBackground);
  background-color: transparent !important;
}

.el-pagination {
  padding: 0;
}
:deep(.el-input){
  bottom: 2px;
}
:deep(.el-input--mini .el-input__inner){
  height: 24px;
}

</style>

<style>
.el-pagination span,.el-pagination li,
.btn-prev i,.btn-next i{
  line-height: 27px !important;
}
</style>