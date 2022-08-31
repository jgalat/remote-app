import packageJson from "./package.json";

export default {
  expo: {
    name:
      process.env.APP_ENV === "development"
        ? "Remote for Transmission (development)"
        : "Remote for Transmission",
    slug: "remote",
    owner: "jgalat",
    version: packageJson.version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "remote",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package:
        process.env.APP_ENV === "development"
          ? "ar.jg.remote.dev"
          : "ar.jg.remote",
      versionCode: +packageJson.version.replaceAll(".", ""),
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "magnet",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          data: [
            {
              scheme: "http",
            },
            {
              scheme: "https",
            },
            {
              host: "*",
              pathPattern: ".*\\.torrent",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
        {
          action: "VIEW",
          data: [
            {
              mimeType: "application/x-bittorrent",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    packagerOpts: {
      config: "metro.config.js",
    },
  },
};
