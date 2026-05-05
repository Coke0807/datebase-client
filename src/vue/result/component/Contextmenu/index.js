
import { createApp, h, defineComponent } from 'vue';
import Contextmenu from "./components/Contextmenu.vue";
import Submenu from "./components/Submenu.vue";
import { COMPONENT_NAME } from "./constant";

let lastInstance = null;

function createContextMenu(options) {
  // 销毁上一个实例
  if (lastInstance) {
    lastInstance.unmount();
    if (lastInstance.container) {
      document.body.removeChild(lastInstance.container);
    }
    lastInstance = null;
  }

  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建应用实例
  const app = createApp({
    render() {
      return h(Contextmenu, {
        items: options.items,
        x: options.x || (options.event ? options.event.clientX : 0),
        y: options.y || (options.event ? options.event.clientY : 0),
        customClass: options.customClass,
        minWidth: options.minWidth,
        zIndex: options.zIndex,
        onClose: () => {
          app.unmount();
          document.body.removeChild(container);
          lastInstance = null;
        }
      });
    }
  });

  const instance = app.mount(container);
  instance.container = container;
  lastInstance = { unmount: () => app.unmount(), container };
  
  return instance;
}

createContextMenu.destroy = function () {
  if (lastInstance) {
    lastInstance.unmount();
    if (lastInstance.container) {
      document.body.removeChild(lastInstance.container);
    }
    lastInstance = null;
  }
};

function install(app) {
  app.component(COMPONENT_NAME, Submenu);
  app.config.globalProperties.$contextmenu = createContextMenu;
}

export default {
  install,
  createContextMenu
};
