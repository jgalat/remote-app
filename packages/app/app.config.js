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
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            enableProguardInReleaseBuilds: true,
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
    ],
    packagerOpts: {
      config: "metro.config.js",
    },
    extra: {
      eas: {
        projectId: "583f843d-ee60-4248-bfe8-4d94bddd0ccf",
      },
    },
  },
};
