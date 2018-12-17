var path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let pathSections = __dirname.split("/");
pathSections.pop();
const homeDirectory = path.resolve(pathSections.join("/"));
const context = path.resolve(homeDirectory, "src");

module.exports = {
    // set default location for everything done in webpack to be /src
    context,
    // where everything starts
    entry: './client.js',
    module: {
        // what to do with different type of files
        rules: [
            {
                // search through every file in the src directory
                include: context,
                // select only the .css files
                test: /\.css$/,
                // used AFTER css-loader; takes the string generated from
                // css-loader and adds it to the DOM with a <script> tag
                use: [
                    "style-loader",
                    "css-loader?modules=true&importLoaders=2&localIdentName=[path]___[name]__[local]___[hash:base64:5]"
                ]
            },
            {
                // search through every file in the src directory
                include: context,
                // find every js file
                test:/\.js$/,
                // make sure not to do this for node_modules because it could
                // screw them up
                exclude:[ /node_modules/ ],
                // use babel to convert all new syntax to syntax that is widely
                // supported accross browsers
                loader: 'babel-loader',
                query: {
                    presets: ['react', 'es2015', 'stage-1'],
                    plugins: [
                        "transform-react-jsx",
                        [
                            "react-css-modules",
                            { context }
                        ]
                    ]
                },
            }
        ]
    },
    // once everything is bundled, put it in /public/bundle.js
    output: {
        filename: 'bundle.js',
        path: path.resolve(homeDirectory, './public')
    },
    // show ALL available webpack information when running
    stats: "verbose",
    // do not include credentials.js or node_modules
    plugins: [
        new webpack.IgnorePlugin(/credentials.js/)
    ],
}
