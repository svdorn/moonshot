const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');

module.exports = merge(baseConfig, {
    // a lot of things talk about this, not sure what it is but could be good
    // devtool: 'eval-source-map',

    mode: 'development',

    // devServer: {
    //     inline: true,
    //     contentBase: 'src',
    //     port: '3001',
    // },

    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/,
    //             use: [
    //                 'style-loader',
    //                 'css-loader?importLoaders=1',
    //             ],
    //         },
    //     ],
    // },
});
