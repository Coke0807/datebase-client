module.exports = {
  purge: ["./src/vue/**/*.vue", "./src/vue/**/*.js"],
  darkMode: 'media', // 使用媒体查询自动适配系统暗黑模式
  theme: {
    extend: {
      colors: {
        // 使用 VS Code CSS 变量定义颜色
        'vscode-bg': 'var(--vscode-editor-background)',
        'vscode-fg': 'var(--vscode-foreground)',
        'vscode-border': 'var(--vscode-panel-border)',
        'vscode-button-bg': 'var(--vscode-button-background)',
        'vscode-button-fg': 'var(--vscode-button-foreground)',
        'vscode-input-bg': 'var(--vscode-input-background)',
        'vscode-input-fg': 'var(--vscode-input-foreground)',
        'vscode-dropdown-bg': 'var(--vscode-dropdown-background)',
        'vscode-dropdown-fg': 'var(--vscode-dropdown-foreground)',
      },
      fontFamily: {
        vscode: 'var(--vscode-font-family)',
      },
      fontSize: {
        vscode: 'var(--vscode-font-size)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark'],
      borderColor: ['dark'],
    },
  },
  plugins: [],
};
