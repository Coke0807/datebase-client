<template>
  <div></div>
</template>

<script>
import { createApp, h, getCurrentInstance, onMounted, onUnmounted, ref, reactive } from "vue";
import { getElementsByClassName } from "../util";
import { COMPONENT_NAME } from "../constant";

export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    customClass: {
      type: String,
      default: null
    },
    minWidth: {
      type: Number,
      default: 150
    },
    zIndex: {
      type: Number,
      default: 2
    },
    onClose: {
      type: Function,
      default: null
    }
  },
  setup(props, { expose }) {
    const instance = getCurrentInstance();
    const mainMenuInstance = ref(null);
    const mouseListening = ref(false);
    const container = ref(null);

    const mouseClickListener = (e) => {
      let el = e.target;
      const menus = getElementsByClassName('menu');
      const menuItems = getElementsByClassName('menu_item');
      const unclickableMenuItems = getElementsByClassName('menu_item__unclickable');
      
      while (
        !menus.find(m => m === el) &&
        !menuItems.find(m => m === el) &&
        el.parentElement
      ) {
        el = el.parentElement;
      }
      
      if (menuItems.find(m => m === el)) {
        if (e.button !== 0 || unclickableMenuItems.find(m => m === el)) {
          return;
        }
        close();
        return;
      }
      
      if (!menus.find(m => m === el)) {
        close();
      }
    };

    const addListener = () => {
      if (!mouseListening.value) {
        document.addEventListener("click", mouseClickListener);
        mouseListening.value = true;
      }
    };

    const removeListener = () => {
      if (mouseListening.value) {
        window.removeEventListener("click", mouseClickListener);
        mouseListening.value = false;
      }
    };

    const close = () => {
      removeListener();
      if (props.onClose) {
        props.onClose();
      }
    };

    onMounted(() => {
      // 创建子菜单容器
      container.value = document.createElement('div');
      document.body.appendChild(container.value);

      // 动态导入 Submenu 组件
      import('./Submenu.vue').then(({ default: Submenu }) => {
        const app = createApp({
          render() {
            return h(Submenu, {
              items: props.items,
              position: { x: props.x, y: props.y, width: 0, height: 0 },
              style: { minWidth: props.minWidth, zIndex: props.zIndex },
              customClass: props.customClass,
              commonClass: {
                menu: 'menu',
                menuItem: 'menu_item',
                clickableMenuItem: 'menu_item__clickable',
                unclickableMenuItem: 'menu_item__unclickable'
              },
              onClose: close
            });
          }
        });
        
        mainMenuInstance.value = app;
        app.mount(container.value);
        addListener();
      });
    });

    onUnmounted(() => {
      removeListener();
      if (mainMenuInstance.value) {
        mainMenuInstance.value.unmount();
      }
      if (container.value) {
        document.body.removeChild(container.value);
      }
    });

    expose({ close });

    return {};
  }
};
</script>

<style>
.menu,
.menu_item,
.menu_item__clickable,
.menu_item__unclickable {
  box-sizing: border-box;
}
</style>