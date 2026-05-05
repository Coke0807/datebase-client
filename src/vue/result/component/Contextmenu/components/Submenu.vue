<template>
  <transition name="contextmenu-submenu-fade">
    <div
      ref="menu"
      :class="[commonClass.menu, 'menu', customClass]"
      :style="{left: style.left + 'px', top: style.top + 'px', minWidth: style.minWidth + 'px', zIndex: style.zIndex}"
      v-if="visible"
      @contextmenu="(e)=>e.preventDefault()"
    >
      <div class="menu_body">
        <template v-for="(item,index) of items">
          <template v-if="!item.hidden">
            <div
              :class="[
                commonClass.menuItem, commonClass.unclickableMenuItem, 
                'menu_item', 'menu_item__disabled',
                item.divided?'menu_item__divided':null
              ]"
              :key="'disabled-' + index"
              v-if="item.disabled"
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon"></div>
            </div>
            <div
              :class="[
                commonClass.menuItem, commonClass.unclickableMenuItem, 
                'menu_item', 'menu_item__available',
                activeSubmenu.index===index? 'menu_item_expand':null,
                item.divided?'menu_item__divided':null
              ]"
              :key="'children-' + index"
              @mouseenter="($event)=>enterItem($event,item,index)"
              v-else-if="item.children"
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon">▶</div>
            </div>
            <div
              :class="[
                commonClass.menuItem, commonClass.clickableMenuItem, 
                'menu_item', 'menu_item__available',
                item.divided?'menu_item__divided':null
              ]"
              :key="'clickable-' + index"
              @mouseenter="($event)=>enterItem($event,item,index)"
              @click="itemClick(item)"
              v-else
            >
              <div class="menu_item_icon" v-if="hasIcon">
                <i :class="item.icon" v-if="item.icon"></i>
              </div>
              <span class="menu_item_label" :title="item.label">{{item.label}}</span>
              <div class="menu_item_expand_icon"></div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </transition>
</template>

<script>
import { createApp, h, ref, reactive, onMounted, nextTick, getCurrentInstance } from "vue";
import {
  SUBMENU_X_OFFSET,
  SUBMENU_Y_OFFSET,
  SUBMENU_OPEN_TREND_LEFT,
  SUBMENU_OPEN_TREND_RIGHT,
  COMPONENT_NAME
} from "../constant";

export default {
  name: COMPONENT_NAME,
  props: {
    commonClass: {
      type: Object,
      default: () => ({})
    },
    items: {
      type: Array,
      default: () => []
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0, width: 0, height: 0 })
    },
    style: {
      type: Object,
      default: () => ({ left: 0, top: 0, zIndex: 2, minWidth: 150 })
    },
    customClass: {
      type: String,
      default: null
    },
    openTrend: {
      type: Number,
      default: SUBMENU_OPEN_TREND_RIGHT
    },
    onClose: {
      type: Function,
      default: null
    }
  },
  setup(props, { expose }) {
    const menu = ref(null);
    const visible = ref(false);
    const hasIcon = ref(false);
    const currentOpenTrend = ref(props.openTrend);
    const activeSubmenu = ref(null);
    const activeSubmenuContainer = ref(null);
    const styleState = reactive({ ...props.style });

    onMounted(() => {
      visible.value = true;
      for (let item of props.items) {
        if (item.icon) {
          hasIcon.value = true;
          break;
        }
      }
      nextTick(() => {
        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;
        const menuEl = menu.value;
        const menuWidth = menuEl.offsetWidth;
        const menuHeight = menuEl.offsetHeight;

        (currentOpenTrend.value === SUBMENU_OPEN_TREND_LEFT
          ? leftOpen
          : rightOpen)(windowWidth, windowHeight, menuWidth);

        styleState.top = props.position.y;
        if (props.position.y + menuHeight > windowHeight) {
          if (props.position.height === 0) {
            styleState.top = props.position.y - menuHeight;
          } else {
            styleState.top = windowHeight - menuHeight;
          }
        }
      });
    });

    const leftOpen = (windowWidth, windowHeight, menuWidth) => {
      styleState.left = props.position.x - menuWidth;
      currentOpenTrend.value = SUBMENU_OPEN_TREND_LEFT;
      if (styleState.left < 0) {
        currentOpenTrend.value = SUBMENU_OPEN_TREND_RIGHT;
        if (props.position.width === 0) {
          styleState.left = 0;
        } else {
          styleState.left = props.position.x + props.position.width;
        }
      }
    };

    const rightOpen = (windowWidth, windowHeight, menuWidth) => {
      styleState.left = props.position.x + props.position.width;
      currentOpenTrend.value = SUBMENU_OPEN_TREND_RIGHT;
      if (styleState.left + menuWidth > windowWidth) {
        currentOpenTrend.value = SUBMENU_OPEN_TREND_LEFT;
        if (props.position.width === 0) {
          styleState.left = windowWidth - menuWidth;
        } else {
          styleState.left = props.position.x - menuWidth;
        }
      }
    };

    const enterItem = (e, item, index) => {
      if (!visible.value) return;
      
      if (activeSubmenu.value) {
        if (activeSubmenu.value.index === index) return;
        activeSubmenu.value.close();
        activeSubmenu.value = null;
      }
      
      if (!item.children) return;

      const menuItemClientRect = e.target.getBoundingClientRect();
      
      // 创建子菜单容器
      const container = document.createElement('div');
      document.body.appendChild(container);
      
      import('./Submenu.vue').then(({ default: Submenu }) => {
        const app = createApp({
          render() {
            return h(Submenu, {
              items: item.children,
              openTrend: currentOpenTrend.value,
              commonClass: props.commonClass,
              position: {
                x: menuItemClientRect.x + SUBMENU_X_OFFSET,
                y: menuItemClientRect.y + SUBMENU_Y_OFFSET,
                width: menuItemClientRect.width - 2 * SUBMENU_X_OFFSET,
                height: menuItemClientRect.width
              },
              style: {
                minWidth: typeof item.minWidth === "number" ? item.minWidth : styleState.minWidth,
                zIndex: styleState.zIndex
              },
              customClass: typeof item.customClass === "string" ? item.customClass : props.customClass,
              onClose: () => {
                app.unmount();
                document.body.removeChild(container);
                activeSubmenu.value = null;
              }
            });
          }
        });
        
        app.mount(container);
        activeSubmenu.value = { index, close: () => {
          app.unmount();
          document.body.removeChild(container);
        }};
        activeSubmenuContainer.value = container;
      });
    };

    const itemClick = (item) => {
      if (!visible.value) return;
      if (item && !item.disabled && !item.hidden && typeof item.onClick === "function") {
        return item.onClick();
      }
    };

    const close = () => {
      visible.value = false;
      if (activeSubmenu.value) {
        activeSubmenu.value.close();
      }
      if (props.onClose) {
        props.onClose();
      }
    };

    expose({ close });

    return {
      menu,
      visible,
      hasIcon,
      styleState,
      enterItem,
      itemClick,
      close
    };
  }
};
</script>

<style scoped>
.menu {
  position: fixed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
  /* background: #fff; */
  background: var(--vscode-menu-background);
  border-radius: 4px;
  /* padding: 0 15px; */
}
.menu_body {
  display: block;
}
.menu_item {
  list-style: none;
  line-height: 32px;
  padding: 0 16px;
  margin: 0;
  font-size: var(--vscode-font-size);
  outline: 0;
  display: flex;
  align-items: center;
  transition: 0.2s;
}
.menu_item__divided {
  /* border-bottom: 1px solid var(--vscode-menu-separatorBackground); ; */
  border-bottom: 1px solid #666A71;
}
.menu_item .menu_item_icon {
  margin-right: 8px;
  width: 13px;
}
.menu_item .menu_item_label {
  flex: 1;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu_item .menu_item_expand_icon {
  margin-left: 16px;
  font-size: 6px;
  width: 10px;
}
.menu_item__available {
  /* color: #606266; */
  color: var(--vscode-menu-foreground);
  cursor: pointer;
}
.menu_item__available:hover {
  /* background: #ecf5ff; */
  background: var(--vscode-menu-selectionBackground);
  /* color: #409eff; */
  color: var(--vscode-menu-selectionForeground);
}
.menu_item__disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}
.menu_item_expand {
  /* background: #ecf5ff; */
  background: var(--vscode-menu-selectionBackground);
  /* color: #409eff; */
  color: var(--vscode-menu-selectionForeground);
}
</style>

<style>
.contextmenu-submenu-fade-enter-active,
.contextmenu-submenu-fade-leave-active {
  transition: opacity 0.1s;
}
.contextmenu-submenu-fade-enter,
.contextmenu-submenu-fade-leave-to {
  opacity: 0;
}
</style>
