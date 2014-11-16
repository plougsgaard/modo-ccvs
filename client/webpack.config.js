var webpack = require("webpack");

var env =
    process.env.BUILD_ENV === "production" && require("./env").production ||
    process.env.BUILD_ENV === "development" && require("./env").development;

if (!env) {
    console.log("Missing `BUILD_ENV`. Example: BUILD_ENV=production webpack");
    return;
}

var config = {
    entry: {
        entry: "./entry.js",
        vendor: ["react", "reqwest", "underscore", "idb-wrapper"]
    },
    output: {
        path: "./dist",
        filename: "[name].js"
    },
    module: {
        loaders: [ {test: /\.css$/, loader: "style!css"} ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.js"),
        new webpack.DefinePlugin({
            // The React library will omit warnings/debug code when this is `production`
            "process.env.NODE_ENV": JSON.stringify(process.env.BUILD_ENV),
            __HOST__: JSON.stringify(env.HOST)
        })
    ]
};

module.exports = config;
