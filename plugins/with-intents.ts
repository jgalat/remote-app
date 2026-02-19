import {
  ConfigPlugin,
  AndroidConfig,
  withAndroidManifest,
} from "expo/config-plugins";

const plugin: ConfigPlugin = (config) => {
  const { getMainApplicationOrThrow, getMainActivityOrThrow } =
    AndroidConfig.Manifest;

  return withAndroidManifest(config, (config) => {
    const app = getMainApplicationOrThrow(config.modResults);

    app.$["android:enableOnBackInvokedCallback"] = "false";

    const activity = getMainActivityOrThrow(config.modResults);

    activity.$["android:launchMode"] = "singleTop";

    if (!app.activity) app.activity = [];

    app.activity.push({
      $: {
        "android:name": "expo.modules.sendintent.TrampolineActivity",
        "android:exported": "true",
        "android:noHistory": "true",
        "android:excludeFromRecents": "true",
        "android:theme": "@android:style/Theme.NoDisplay",
      },
      "intent-filter": [
        {
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [{ $: { "android:scheme": "magnet" } }],
          category: [
            { $: { "android:name": "android.intent.category.DEFAULT" } },
            { $: { "android:name": "android.intent.category.BROWSABLE" } },
          ],
        },
        {
          action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
          data: [
            {
              $: {
                "android:scheme": "content",
                "android:mimeType": "application/x-bittorrent",
              },
            },
            {
              $: {
                "android:scheme": "file",
                "android:mimeType": "application/x-bittorrent",
                "android:pathPattern": "/.*\\.torrent",
              },
            },
          ],
          category: [
            { $: { "android:name": "android.intent.category.DEFAULT" } },
            { $: { "android:name": "android.intent.category.BROWSABLE" } },
          ],
        },
        {
          action: [{ $: { "android:name": "android.intent.action.SEND" } }],
          data: [{ $: { "android:mimeType": "application/x-bittorrent" } }],
          category: [
            { $: { "android:name": "android.intent.category.DEFAULT" } },
          ],
        },
      ],
    });

    return config;
  });
};

export default plugin;
