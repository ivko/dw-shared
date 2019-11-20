const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    entry: {
        "dw-core":  __dirname + "/dw-core.js"
    },
    output: {
        filename: "[name].js",
        library: "[name]",
        libraryTarget: "umd",
        umdNamedDefine: true,
        path: path.resolve(__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: {
                    loader: "babel-loader", 
                    options: {
                        //presets: ['es2015'],
                        plugins: [
                            "@babel/plugin-syntax-dynamic-import"
                        ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
        alias: {
            "mootools-core": __dirname + "/Scripts/Mootools/mootools-core.js",
            "mootools-interfaces": __dirname + "/Scripts/Mootools/mootools-interfaces.js",
        }
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    mode: "development",
    watch: false,
    plugins: [
        /*new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),*/
        new webpack.NamedModulesPlugin(),
        //new webpack.HotModuleReplacementPlugin()
    ],
    externals: {
        jquery: {
            amd: 'jquery', 
            root: '$', 
            commonjs: 'jquery', 
            commonjs2: 'jquery'
        },
        knockout: {
            amd: 'knockout', 
            root: 'ko', 
            commonjs: 'knockout', 
            commonjs2: 'knockout'
        }
    },
    devServer: {
        contentBase: path.resolve(__dirname, '.'),
        hot: true
    }
};