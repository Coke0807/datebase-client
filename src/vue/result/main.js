import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'
import Contextmenu from "./component/Contextmenu"
import '@/../public/theme/auto.css'
import './view.css'
import './icon/iconfont.css'

const app = createApp(App)
app.use(ElementPlus, { locale: zhCn })
app.use(VxeTable)
app.use(Contextmenu)
app.mount('#app')
