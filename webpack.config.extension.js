const path = require('path');
var webpack = require('webpack');

module.exports = {
    target: "node",
    node: {
        fs: 'empty', net: 'empty', tls: 'empty',
        child_process: 'empty', dns: 'empty',
        global: true, __dirname: true
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
        'mongodb-client-encryption':'mongodb-client-encryption'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    plugins: [
        new webpack.IgnorePlugin(/^(pg-native|cardinal|encoding|aws4|pg-cloudflare)$/)
    ],
    module: { rules: [{ test: /\.ts$/, exclude: /(node_modules|bin)/, use: ['ts-loader'] }] },
    optimization: { minimize: false },
    watch: false,
    mode: 'production',
    devtool: false,
};
