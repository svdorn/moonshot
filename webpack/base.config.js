var path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/client.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../public')
    },
    plugins: [
        new webpack.IgnorePlugin(/credentials.js|node_modules/)
    ],
    module: {
        rules: [
            // change all the local css to be global with a prefix
            {
                test: /\.css$/,
                include: path.resolve(__dirname, '../src'),
                loaders: [
                    "style-loader",
                    "css-loader?importLoader=1&modules&localIdentName=[path]___[name]__[local]___[hash:base64:5]"
                ]
            },
            {
                test:/\.js$/,
                exclude:[
                    /node_modules/,
                    path.resolve(__dirname, "../credentials.js"),
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-1']
                }
            }
        ]
    }
}
