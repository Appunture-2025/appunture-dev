const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Substituir import.meta com valor estático
  const webpack = require("webpack");
  const appRoot = "../../app";
  config.plugins.unshift(
    new webpack.DefinePlugin({
      "import.meta": JSON.stringify({
        env: "development",
      }),
      "process.env.EXPO_ROUTER_APP_ROOT": JSON.stringify(appRoot),
    })
  );

  return config;
};
