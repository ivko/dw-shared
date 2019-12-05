const path = require("path");
const webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: {
        "core":  [__dirname + "/src/entrypoint.ts", __dirname + "/src/core.ts"],
        "themes/dwtheme": [__dirname + "/src/entrypoint.ts", __dirname + "/src/themes/dwtheme.js"],
        "themes/dwstrap": [__dirname + "/src/entrypoint.ts", __dirname + "/src/themes/dwstrap.js"],
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
                loader: "babel-loader"
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.less$/,// compiles Less to CSS
                use: [
                    {
                      loader: 'style-loader', // creates style nodes from JS strings
                    },
                    {
                      loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                      loader: 'less-loader', // compiles Less to CSS
                      options: {
                        paths: [path.resolve(__dirname, 'node_modules')],
                        sourceMap: true,
                      },
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [/*{
                    loader: "./tools/dw-template-loader"
                },*/
                {
                    loader: "html-loader"
                }]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name]_[hash:10].[ext]',
                        outputPath: "images/",
                    },
                },
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[name]_[hash:10].[ext]',
                    outputPath: "fonts/"
                },
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ],
        alias: {
            "mootools-core": __dirname + "/libs/mootools-core.js",
            "knockout": __dirname + '/node_modules/knockout/build/output/knockout-latest.debug.js',
            "jquery": __dirname + '/node_modules/jquery/dist/jquery.js',
            "jstz": __dirname + '/node_modules/jstz/dist/jstz.js',
            "moment": __dirname + '/node_modules/moment/moment.js',
            "spin": __dirname + '/node_modules/spin.js/spin.js',
            // Own / Edited libraries
            "globalize": __dirname + '/libs/globalize.js',
            "toastr": __dirname + '/libs/toastr.js',
            "jquery-ui": __dirname + '/libs/jquery-ui-1.12.1.custo.jsm'
        }
    },
    optimization: {
        splitChunks: {
            //chunks: 'all',
        },
    },
    mode: "development",
    watch: false,
    plugins: [
        new webpack.NamedModulesPlugin()
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
        },
        'globalize': 'globalize',
        'jstz': 'jstz',
        'moment': 'moment',
        'toastr': 'toastr',
        'jquery-ui': 'jquery-ui',
        'spin': 'spin'
    },
    devServer: {
        contentBase: path.resolve(__dirname, '.'),
        hot: true
    }
};