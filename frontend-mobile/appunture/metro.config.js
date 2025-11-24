const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow resolving wasm modules required by expo-sqlite during web builds
config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('wasm')) {
	config.resolver.assetExts.push('wasm');
}

module.exports = config;
