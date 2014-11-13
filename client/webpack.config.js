var webpack = require("webpack");

var _ = require("lodash");
var prodEnv = require("./env").production;
var devEnv = require("./env").development;

var envName = process.env.BUILD_ENV;
var allowedEnvironments = ["production", "development"];
if (!_.contains(allowedEnvironments, process.env.BUILD_ENV)) {
    envName = "development";
}

var sharedConfig = {
    entry: {
        entry: "./entry.js",
        vendor: ["react", "reqwest", "underscore", "idb-wrapper"]
    },
    output: {
        path: "./dist",
        filename: "[name].js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js")
    ]
};

var devConfig = {
    entry: sharedConfig.entry,
    output: sharedConfig.output,
    module: sharedConfig.module,
    plugins: _.union(sharedConfig.plugins, [
        new webpack.DefinePlugin({ __HOST__: JSON.stringify(devEnv.HOST) })
    ])
};

var prodConfig = {
    entry: sharedConfig.entry,
    output: sharedConfig.output,
    module: _.extend(_.cloneDeep(sharedConfig.module),
        { noParse: /react\.min\.js$/ }),
    plugins: _.union(sharedConfig.plugins, [
        new webpack.DefinePlugin({ __HOST__: JSON.stringify(prodEnv.HOST) }),
        new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    ]),
    resolve: {
        alias: {
            "react": __dirname.concat("/node_modules/react/dist/react.min.js")
        }
    }
};
//{ unused: false, warnings: false }
module.exports =
    envName == "development" && devConfig ||
    envName == "production" && prodConfig;
