const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Allow resolving wasm modules required by expo-sqlite during web builds
  config.resolver.assetExts = config.resolver.assetExts || [];
  if (!config.resolver.assetExts.includes("wasm")) {
    config.resolver.assetExts.push("wasm");
  }

  // Ensure SQLite bundle (.db) is treated as an asset for OTA/build packaging
  if (!config.resolver.assetExts.includes("db")) {
    config.resolver.assetExts.push("db");
  }

  // Use react-native-svg-transformer so imported .svg files become React components
  // Remove 'svg' from assetExts and add it to sourceExts so the transformer runs
  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );
  config.resolver.sourceExts = Array.from(
    new Set([...(config.resolver.sourceExts || []), "svg"])
  );

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  return config;
})();
