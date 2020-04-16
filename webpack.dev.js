const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "build/debug/"),
    hot: true
  },
  output: {
    path: path.resolve(__dirname, "build/debug")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          "source-map-loader",
          {
            loader: path.resolve("./build-system/preprocess-loader.js"),
            options: {
              DEBUG: true
            }
          }
        ]
      }
    ]
  }
});
