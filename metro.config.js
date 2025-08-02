const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

module.exports = wrapWithReanimatedMetroConfig(config);
