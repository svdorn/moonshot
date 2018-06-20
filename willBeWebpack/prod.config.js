// const webpack = require('webpack');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./base.config.js');

module.exports = merge(baseConfig, {
    // output: {
    //     path: 'build',
    //     filename: '[name].bundle.[chunkhash].js',
    // },

    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/,
    //             use: ExtractTextPlugin.extract({
    //                 use: [
    //                     'css-loader',
    //                 ],
    //             }),
    //         },
    //     ],
    // },

    // mark us as in production mode
    mode: 'production',

    // minimize JS
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true
            })
        ]
    },

    // plugins: [
    //     // Extract imported CSS into own file
    //     new ExtractTextPlugin('[name].bundle.[chunkhash].css'),
    //     // Minify JS
    //     // new UglifyJsPlugin({
    //     //     sourceMap: false,
    //     //     compress: true,
    //     // }),
    //     // Minify CSS
    //     new webpack.LoaderOptionsPlugin({
    //         minimize: true,
    //     }),
    // ],
});
