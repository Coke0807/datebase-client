import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'
import { createRouter, createWebHashHistory } from 'vue-router'
import i18nMixin from './mixin/i18n';

import '@/../public/theme/auto.css'
import "tailwindcss/tailwind.css"

import connect from "./connect/index.vue";
import status from "./status/index.vue";
import design from "./design/index.vue";
import structDiff from "./structDiff/index.vue";
import keyView from "./redis/keyView.vue";
import terminal from "./redis/terminal.vue";
import redisStatus from "./redis/redisStatus.vue";
import forward from "./forward/index.vue";
import sshTerminal from "./xterm/index.vue";

const routes = [
  { path: '/connect', component: connect, name: 'connect' },
  { path: '/status', component: status, name: 'status' },
  { path: '/design', component: design, name: 'design' },
  { path: '/structDiff', component: structDiff, name: 'structDiff' },
  // redis
  { path: '/keyView', component: keyView, name: 'keyView' },
  { path: '/terminal', component: terminal, name: 'terminal' },
  { path: '/redisStatus', component: redisStatus, name: 'redisStatus' },
  // ssh
  { path: '/forward', component: forward, name: 'forward' },
  { path: '/sshTerminal', component: sshTerminal, name: 'sshTerminal' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)

// 注册全局 mixin
app.mixin(i18nMixin)

app.use(ElementPlus, { locale: zhCn })
app.use(VxeTable)
app.use(router)
app.mount('#app')
