const { getDefaultConfig } = require("expo/metro-config");

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

// Ensure SVG files are treated as assets for BodyMap components
if (!config.resolver.assetExts.includes("svg")) {
  config.resolver.assetExts.push("svg");
}

module.exports = config;
