const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/app.js",
  devServer: {
    static: [
      {
        directory: path.join(__dirname),
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [{}],
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};
