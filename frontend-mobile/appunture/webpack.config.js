const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Substituir import.meta com valor estático
  const webpack = require('webpack');
  config.plugins.unshift(
    new webpack.DefinePlugin({
      'import.meta': JSON.stringify({
        env: 'development'
      })
    })
  );

  return config;
};
