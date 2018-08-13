var path = require('path');
const webpack = require('webpack');

console.log("__dirname: ", __dirname);

let pathSections = __dirname.split("/");
pathSections.pop();
const homeDirectory = path.resolve(pathSections.join("/"));
console.log("homeDirectory: ", homeDirectory);
const context = path.resolve(homeDirectory, "src");

console.log("context: ", context);

module.exports = {
    context,
    entry: './client.js',
    plugins: [
        new webpack.IgnorePlugin(/credentials.js|node_modules/)
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: "style-loader!css-loader?modules=true&importLoaders=1&localIdentName=[path]__[name]__[local]___[hash:base64:5]"
            },
            {
                exclude:[
                    /node_modules/,
                    path.resolve(__dirname, "../credentials.js"),
                ],
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-1'],
                    plugins: [
                        "babel-plugin-react-css-modules"
                    ]
                },
                test:/\.js$/,
            }
        ]
    },
    // once everything is bundled, put it in /public/bundle.js
    output: {
        filename: 'bundle.js',
        path: path.resolve(homeDirectory, './public')
    },
    // show all webpack information when running
    stats: "verbose"
}
