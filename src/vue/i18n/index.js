import zhCN from './zh-CN';
import enUS from './en-US';

// 检测系统语言，默认使用简体中文
const defaultLocale = 'zh-CN';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 简单的 i18n 函数
function t(key) {
  const keys = key.split('.');
  let value = messages[defaultLocale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return value || key;
}

// 导出 i18n 函数和消息对象
export { t, messages, defaultLocale };
