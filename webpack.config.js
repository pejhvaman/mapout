const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/app.js"), // Make sure this path is correct
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/", // Ensure the correct path is used in dev server
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "assets/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "app.css",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/assets", to: "assets" }, // Ensure assets are copied properly
      ],
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, "dist"), // Serve static files
    hot: true,
    port: 3000,
    historyApiFallback: true, // Ensures the correct routing for SPA
  },
  mode: "development",
};
