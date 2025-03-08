const path = require("path");
const CleanPlugin = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/app.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Ensure this points to the dist folder
    publicPath: "/", // Add publicPath for proper routing
  },
  module: {
    rules: [
      // Add your specific loaders if needed, e.g., Babel
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [new CleanPlugin.CleanWebpackPlugin()],
};
