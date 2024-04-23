const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const { all } = require("axios");

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack(config) {
    config.plugin("monaco").use(new MonacoWebpackPlugin());
  },

  // publicPath: "/oj", //项目前缀
  devServer: {
    port: 50010, //启动端口
    // disableHostCheck: true, //允许穿透
    // allowedHosts: "all",
  },
});
