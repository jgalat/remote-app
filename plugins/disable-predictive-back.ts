import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const plugin: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;
    app.$["android:enableOnBackInvokedCallback"] = "false";
    return config;
  });
};

export default plugin;
