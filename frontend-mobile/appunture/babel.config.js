// Strip unsupported `import.meta` from dependencies when bundling for web.
const replaceImportMeta = () => ({
  visitor: {
    MetaProperty(path) {
      const isImportMeta =
        path.node.meta?.name === "import" &&
        path.node.property?.name === "meta";
      if (isImportMeta) {
        path.replaceWithSourceString("({})");
      }
    },
  },
});

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [replaceImportMeta, "react-native-reanimated/plugin"],
  };
};
