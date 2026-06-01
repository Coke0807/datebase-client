const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack');
const isProd = process.argv.indexOf('--mode=production') >= 0;

module.exports = [
    {
        target: "node",
        // Webpack 5: 移除 node polyfill，使用 resolve.fallback 替代
        node: {
            global: true,
            __dirname: false,
            __filename: false,
        },
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@': path.resolve(__dirname, './src')
            }
            // Webpack 5: Node.js 扩展不需要 fallback，直接使用 Node.js 内置模块
        },
        entry: ['./src/extension.ts'],
        output: {
            path: path.resolve(__dirname, 'out'),
            filename: 'extension.js',
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '[absoluteResourcePath]',
        },
        externals: {
            vscode: 'commonjs vscode',
            mockjs: 'mockjs vscode',
            'mongodb-client-encryption':'mongodb-client-encryption',
            // 原生模块（.node 二进制文件）无法被 webpack 打包，需外部化由运行时 require
            'cpu-features': 'commonjs cpu-features',
            '../build/Release/cpufeatures.node': 'commonjs ../build/Release/cpufeatures.node',
            './crypto/build/Release/sshcrypto.node': 'commonjs ./crypto/build/Release/sshcrypto.node',
        },
        plugins: [
            new webpack.IgnorePlugin({
                resourceRegExp: /^(pg-native|cardinal|encoding|aws4|pg-cloudflare)$/
            })
        ],
        module: { 
            rules: [
                { test: /\.ts$/, exclude: /(node_modules|bin)/, use: ['ts-loader'] }
            ] 
        },
        optimization: { minimize: isProd },
        // Webpack 5: 持久化缓存
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename]
            }
        },
        watch: !isProd,
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'source-map',
    },
    {
        entry: {
            app: './src/vue/main.js',
            query: './src/vue/result/main.js'
        },
        resolve: {
            extensions: ['.vue', '.js'],
            alias: { 
                'vue$': 'vue/dist/vue.esm-bundler.js', 
                '@': path.resolve('src'),
            },
            // Webpack 5: WebView 浏览器环境需要的 polyfill
            fallback: {
                "process": require.resolve("process/browser"),
                "buffer": require.resolve("buffer/"),
                "stream": require.resolve("stream-browserify"),
                "util": require.resolve("util/"),
            }
        },
        plugins: [
            new VueLoaderPlugin(),
            // Webpack 5: 提供 process 和 Buffer 全局变量
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
            new HtmlWebpackPlugin({ 
                inject: true, 
                template: './public/index.html', 
                chunks: ['app'], 
                filename: 'webview/app.html' 
            }),
            new HtmlWebpackPlugin({ 
                inject: true, 
                templateContent: `<head><script src="js/oldCompatible.js"></script></head><body> <div id="app"></div> </body>`, 
                chunks: ['query'], 
                filename: 'webview/result.html' 
            }),
            new CopyWebpackPlugin({
                patterns: [{ from: 'public', to: './webview' }]
            }),
        ],
        output: {
            path: path.resolve(__dirname, 'out'),
            filename: 'webview/js/[name].js'
        },
        module: {
            rules: [
                // Webpack 5: vue-loader 配置更新
                { 
                    test: /\.vue$/, 
                    loader: 'vue-loader'
                },
                { test: /(\.css|\.cssx)$/, use: ["vue-style-loader", "css-loader", { loader: "postcss-loader" }] },
                // Webpack 5: 使用 Asset Modules 替代 url-loader
                { 
                    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            maxSize: 80000 // 80KB
                        }
                    },
                    generator: {
                        filename: 'webview/fonts/[name].[hash:8][ext]'
                    }
                }
            ]
        },
        optimization: {
            minimize: isProd,
            splitChunks: {
                cacheGroups: {
                    antv: { name: "antv", test: /[\\/]@antv[\\/]/, chunks: "all", priority: 10 },
                    vendor: { name: "vendor", test: /[\\/]node_modules[\\/]/, chunks: "all", priority: -1 }
                }
            }
        },
        // Webpack 5: 持久化缓存
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename]
            }
        },
        watch: !isProd,
        mode: isProd ? 'production' : 'development',
        devtool: isProd ? false : 'source-map',
    }
];
