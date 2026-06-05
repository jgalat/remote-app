import "tsx/cjs";
import type { ExpoConfig } from "expo/config";
import * as fs from "fs";
import * as path from "path";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"),
);

const [major, minor, patch] = packageJson.version.split(".").map(Number);
const versionCode = major * 10_000 + minor * 100 + patch;

const proPackagePath = path.resolve(process.cwd(), "packages/pro/package.json");
const hasProPackage = fs.existsSync(proPackagePath);

const proPlugins: (string | [string, unknown])[] = hasProPackage
  ? ["./packages/pro/plugins/with-torrent-engine.ts"]
  : [];

export default {
  name:
    process.env.APP_ENV === "development" ? "Remote (development)" : "Remote",
  slug: "remote",
  owner: "jgalat",
  version: packageJson.version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "remote",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],
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
      monochromeImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package:
      process.env.APP_ENV === "development"
        ? "ar.jg.remote.dev"
        : "ar.jg.remote",
    versionCode,
    softwareKeyboardLayoutMode: "pan",
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
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          buildToolsVersion: "36.0.0",
          enableMinifyInReleaseBuilds: true,
          // expo-task-manager boots headless JS via Class.forName on a class
          // name stored in manifest meta-data, which R8 can't see.
          extraProguardRules:
            "-keep class expo.modules.adapters.react.apploader.RNHeadlessAppLoader { *; }",
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
    "expo-background-task",
    "./plugins/with-intents.ts",
    "./plugins/with-user-ca.ts",
    ...proPlugins,
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "583f843d-ee60-4248-bfe8-4d94bddd0ccf",
    },
  },
} satisfies ExpoConfig;
