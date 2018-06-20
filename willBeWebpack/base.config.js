var path = require('path');

const webpack = require('webpack');

module.exports = {
    entry: './src/client.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    plugins: [
        new webpack.IgnorePlugin(/credentials.js|node_modules/)
    ],
    watch: true,
    module: {
        rules: [
            {
                test:/\.js$/,
                exclude:[
                    /node_modules/,
                    path.resolve(__dirname, "./credentials.js"),
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-1']
                }
            }
        ]
    }
}
