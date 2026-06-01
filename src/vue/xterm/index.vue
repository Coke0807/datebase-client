<template>
    <div class="box">
        <div id="header">
            <div id="status"></div>
        </div>
        <div id="terminal-container" class="terminal"></div>
    </div>
</template>

<script>
    import { Terminal } from 'xterm'
    import { FitAddon } from 'xterm-addon-fit'
    import { WebLinksAddon } from "xterm-addon-web-links";
    import { SearchAddon } from 'xterm-addon-search';
    import { SearchBarAddon } from './xterm-addon-search-bar';
    import { auto } from "./theme/auto";
    require('xterm/css/xterm.css')
    import { inject } from "../mixin/vscodeInject";
    export default {
        mixins: [inject],
        data() {
            return {};
        },
        mounted() {
            this.on("terminalConfig", (data) => {
                var errorExists = false;
                const terminal = new Terminal({
                    theme: auto(),
                    cursorStyle: "bar",
                    fontSize: data.fontSize,
                    fontFamily: "'Consolas ligaturized',Consolas, 'Microsoft YaHei','Courier New', monospace",
                    disableStdin: false,
                    lineHeight: 1.1,
                    rightClickSelectsWord: true,
                    cursorBlink: true, scrollback: 10000, tabStopWidth: 8, bellStyle: "sound"
                })

                const fitAddon = new FitAddon()
                const searchAddon = new SearchAddon();
                const searchAddonBar = new SearchBarAddon({ searchAddon });

                terminal.loadAddon(fitAddon)
                terminal.loadAddon(searchAddon)
                terminal.loadAddon(searchAddonBar);
                terminal.loadAddon(new WebLinksAddon(() => { }, {
                    willLinkActivate: (e, uri) => {
                        // set timeout to remove selection
                        setTimeout(() => {
                            this.emit('openLink', uri)
                        }, 100);
                    }
                }))

                const container = document.getElementById('terminal-container');
                terminal.onKey(async e => {
                    const event = e.domEvent;
                    if (event.code == "KeyC" && event.ctrlKey && !event.altKey && !event.shiftKey) {
                        if (terminal.hasSelection()) {
                            // Use modern Clipboard API instead of deprecated execCommand
                            const selection = terminal.getSelection();
                            if (selection) {
                                navigator.clipboard.writeText(selection);
                            }
                        }
                        return;
                    } else if ((event.code == "KeyV" && event.ctrlKey && !event.altKey && !event.shiftKey) ||
                        (event.code == "KeyF" && event.ctrlKey && !event.altKey && !event.shiftKey)
                    ) {
                        return;
                    } else {
                        const new_e = new event.constructor(event.type, event);
                        document.getElementById("header").dispatchEvent(new_e);
                    }
                })
                terminal.open(container)
                fitAddon.fit()
                terminal.focus()
                // Store references for cleanup in beforeUnmount
                this._terminal = terminal;
                this._fitAddon = fitAddon;
                terminal.onData((data) => {
                    this.emit('data', data)
                })

                const resizeScreen = () => {
                    fitAddon.fit()
                    this.emit('resize', { cols: terminal.cols, rows: terminal.rows })
                }

                this._resizeHandler = resizeScreen;
                this._keyupHandler = async event => {
                    if (event.code == "KeyV" && event.ctrlKey && !event.altKey && !event.shiftKey) {
                        this.emit('data', await navigator.clipboard.readText())
                    } else if (event.code == "KeyF" && event.ctrlKey && !event.altKey && !event.shiftKey) {
                        searchAddonBar.show();
                    } else if (event.code == "Escape") {
                        searchAddonBar.hidden();
                    }
                };
                this._focusHandler = () => {
                    terminal.focus()
                };

                window.addEventListener('resize', this._resizeHandler, false)
                window.addEventListener("keyup", this._keyupHandler)
                window.onfocus = this._focusHandler

                container.oncontextmenu = async (event) => {
                    event.stopPropagation()
                    if (terminal.hasSelection()) {
                        // Use modern Clipboard API instead of deprecated execCommand
                        const selection = terminal.getSelection();
                        if (selection) {
                            navigator.clipboard.writeText(selection);
                        }
                        terminal.clearSelection()
                    } else {
                        this.emit('data', await navigator.clipboard.readText())
                    }
                }

                const status = document.getElementById('status')
                this
                    .on('connecting', content => {
                        terminal.write(content)
                        // terminal.focus()
                    })
                    .on('data', (content) => {
                        terminal.write(content)
                        // terminal.focus()
                    })
                    .on('path', path => {
                        this.emit('data', `cd ${path}\n`)
                    })
                    .on('status', (data) => {
                        resizeScreen()
                        status.textContent = data
                        status.style.backgroundColor = '#338c33'
                        // terminal.focus()
                    })
                    .on('ssherror', (data) => {
                        status.textContent = data
                        status.style.backgroundColor = 'red'
                        errorExists = true
                    })
                    .on('error', (err) => {
                        if (!errorExists) {
                            status.style.backgroundColor = 'red'
                            status.textContent = 'ERROR: ' + err
                        }
                    });

                this.emit('initTerminal', { cols: terminal.cols, rows: terminal.rows })
            }).init();
        },
        beforeUnmount() {
            // Dispose terminal instance to free GPU/canvas resources
            if (this._terminal) {
                this._terminal.dispose();
            }
            // R-03: Clean up event listeners to prevent memory leaks
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
            }
            if (this._keyupHandler) {
                window.removeEventListener('keyup', this._keyupHandler);
            }
            window.onfocus = null;
        },
        methods: {}
    };
</script>
<style scoped>
    body,
    html {
        font-family: var(--vscode-font-family) !important;
        font-size: var(--vscode-font-size) !important;
        color: var(--vscode-foreground) !important;
        background-color: var(--vscode-editor-background) !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .dropup-content {
        display: none;
    }

    #header {
        background-color: var(--vscode-editorGroupHeader-tabsBackground, var(--vscode-titleBar-activeBackground)) !important;
        color: var(--vscode-titleBar-activeForeground, var(--vscode-foreground)) !important;
        width: 100%;
        border-color: var(--vscode-panel-border, var(--vscode-dropdown-border));
        border-style: none none solid none;
        border-width: 1px;
        text-align: center;
        flex: 0 1 auto;
        z-index: 99;
        height: 19px;
    }

    #header a {
        color: var(--vscode-textLink-foreground) !important;
    }

    .box {
        display: block;
        height: 100%;
    }

    #terminal-container {
        display: block;
        width: calc(100% - 1px);
        margin: 0 auto;
        height: 95vh;
    }

    #terminal-container .terminal {
        background-color: var(--vscode-terminal-background, #000000) !important;
        color: var(--vscode-terminal-foreground, #fafafa) !important;
        height: 95vh;
    }

    #terminal-container .terminal:focus .terminal-cursor {
        background-color: var(--vscode-terminalCursor-foreground, #fafafa) !important;
    }

    #bottomdiv {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        background-color: var(--vscode-statusBar-background, rgb(50, 50, 50)) !important;
        border-color: var(--vscode-statusBar-border, var(--vscode-panel-border));
        border-style: solid none none none;
        border-width: 1px;
        z-index: 99;
        height: 19px;
    }

    #status {
        background-color: var(--vscode-testing.iconPassed, #338c33) !important;
        display: inline-block;
        padding-left: 10px;
        padding-right: 10px;
        border-color: var(--vscode-panel-border, white);
        border-style: none solid none solid;
        border-width: 1px;
        text-align: left;
        z-index: 100;
    }

    @keyframes countdown {
        from {
            background-color: rgb(255, 255, 0);
        }

        to {
            background-color: inherit;
        }
    }

    #menu {
        display: inline-block;
        font-size: 16px;
        color: rgb(255, 255, 255);
        z-index: 100;
    }

    #menu:hover .dropup-content {
        display: block;
    }

    #logBtn,
    #credentialsBtn,
    #reauthBtn {
        color: #000;
    }
</style>