<template>
  <div>
    <blockquote class="panel" id="error" v-if="error">
      <p class="panel__text">
        {{ t('forward.connectionError') }} <span id="errorMessage" v-text="errorMessage"></span><br />
      </p>
    </blockquote>
    <el-table :data="forwardList" style="width: 100%">
      <el-table-column prop="name" :label="t('forward.name')">
      </el-table-column>
      <el-table-column prop="localHost" :label="t('forward.localHost')">
      </el-table-column>
      <el-table-column prop="localPort" :label="t('forward.localPort')">
      </el-table-column>
      <el-table-column prop="remoteHost" :label="t('forward.remoteHost')">
      </el-table-column>
      <el-table-column prop="remotePort" :label="t('forward.remotePort')">
      </el-table-column>
      <el-table-column prop="state" :label="t('forward.state')">
        <template #default="scope">
          {{scope.row.state==true? t('forward.running') : t('forward.stopped')}}
        </template>
      </el-table-column>
      <el-table-column fixed="right" width="200">
        <template #header="scope">
          <el-button type="info" icon="el-icon-circle-plus-outline" size="small" circle @click="createRequest">
          </el-button>
          <el-button type="primary" icon="el-icon-refresh" size="small" circle @click="load"> </el-button>
        </template>
        <template #default="scope">
          <el-button v-if="!scope.row.state" @click="start(scope.row.id);" type="success" size="small" :title="t('forward.start')"
            icon="el-icon-video-play" circle>
          </el-button>
          <el-button v-if="scope.row.state" @click="stop(scope.row.id);" type="danger" size="small" :title="t('forward.stop')"
            icon="el-icon-switch-button" circle>
          </el-button>
          <el-button @click="openEdit(scope.row);" type="primary" size="small" :title="t('forward.edit')" icon="el-icon-edit" circle>
          </el-button>
          <el-button @click="info(scope.row);" type="info" size="small" :title="t('forward.showCommand')" icon="el-icon-info" circle>
          </el-button>
          <el-button @click="deleteConfirm(scope.row.id)" :title="t('forward.delete')" type="danger" size="small"
            icon="el-icon-delete" circle>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog ref="editDialog" :title="panel.title" v-model="panel.visible" width="90%" top="3vh">
      <el-form ref="infoForm" :model="panel.edit" label-width="120px">
        <el-form-item size="small" :label="t('forward.name')">
          <el-input v-model="panel.edit.name"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="t('forward.localHost')">
          <el-input v-model="panel.edit.localHost"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="t('forward.localPort')">
          <el-input v-model="panel.edit.localPort"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="t('forward.remoteHost')">
          <el-input v-model="panel.edit.remoteHost"></el-input>
        </el-form-item>
        <el-form-item size="small" :label="t('forward.remotePort')">
          <el-input v-model="panel.edit.remotePort"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="panel.visible = false">{{ t('forward.cancel') }}</el-button>
          <el-button type="primary" :loading="panel.loading" @click="confirmUpdate">
            {{panel.edit.id!=null? t('forward.update') : t('forward.create')}}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import { inject } from "../mixin/vscodeInject";
  export default {
    mixins: [inject],
    data() {
      return {
        title: "",
        config: {},
        forwardList: [],
        error: false,
        errorMessage: "",
        panel: {
          title: t('forward.create'),
          visible: false,
          loading: false,
          edit: {}
        }
      };
    },
    mounted() {
      this.on("forwardList", content => {
        this.forwardList = content;
        this.panel.loading = false;
        this.panel.visible = false;
      }).on("config", content => {
        this.title = content.host;
        this.config = content;
      }).on("success", (content) => {
        this.error = false;
        this.emit("load")
      }).on("error", content => {
        this.error = true;
        this.errorMessage = content;
      }).init()
    },
    methods: {
      createRequest() {
        this.panel.edit = {
          localHost: "127.0.0.1",
          remoteHost: "127.0.0.1"
        };
        this.panel.visible = true;
      },
      load() {
        this.emit("load")
      },
      confirmUpdate() {
        this.emit("update",this.panel.edit)
        this.panel.loading = true;
      },
      info(row) {
        this.emit("cmd",`ssh  -qTnN -L ${row.localHost}:${row.localPort}:${row.remoteHost}:${row.remotePort} ${this.config.username}@${this.config.host}`)
      },
      start(id) {
        this.emit("start", id)
      },
      stop(id) {
        this.emit("stop", id)
      },
      remove(id) {
        this.emit("remove", id)
      },
      openEdit(row) {
        this.panel.edit = row;
        this.panel.visible = true;
      },
      deleteConfirm(id) {
        this.$confirm(
          this.t('forward.confirmDeleteForward'),
          this.t('common.warning'),
          {
            confirmButtonText: this.t('common.ok'),
            cancelButtonText: this.t('common.cancel'),
            type: "warning"
          }
        )
          .then(() => {
            this.remove(id);
          })
          .catch(() => {
            this.$message({ type: "info", message: this.t('forward.deleteCanceled') });
          });
      }
    }
  };
</script>