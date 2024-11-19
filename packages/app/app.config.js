import packageJson from "./package.json";

export default {
  expo: {
    name:
      process.env.APP_ENV === "development" ? "Remote (development)" : "Remote",
    slug: "remote",
    owner: "jgalat",
    version: packageJson.version,
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "remote",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "ar.jg.remote",
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
          data: [{ scheme: "magnet" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000",
          },
          imageWidth: 240,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/RobotoMono-Regular.ttf",
            "./assets/fonts/RobotoMono-Medium.ttf",
          ],
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
          },
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/notification-icon.png",
          color: "#ffffff",
        },
      ],
      "expo-asset",
      "expo-font",
    ],
    packagerOpts: {
      config: "metro.config.js",
    },
    experimentas: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "583f843d-ee60-4248-bfe8-4d94bddd0ccf",
      },
    },
  },
};
