const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

const proPackage = path.resolve(__dirname, "packages/pro/package.json");
if (!fs.existsSync(proPackage)) {
  config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    "@remote-app/pro": path.resolve(__dirname, "src/pro/stub-package"),
  };
}

module.exports = config;
