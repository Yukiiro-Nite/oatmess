const webpack = require('webpack');
const path = require("path");

const dist = path.resolve(__dirname, "dist");

const mode = "development";

const appConfig = {
  mode: mode,
  entry: "./src/routes/routes.js",
  devServer: {
    contentBase: dist
  },
  resolve: {
    extensions: [".js", ".wasm"]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: dist,
    filename: "routes.js"
  },
  plugins: [
    new webpack.IgnorePlugin(/(fs)/)
  ],
  target: 'node'
};

module.exports = [appConfig];