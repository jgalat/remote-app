import { ConfigPlugin, withAndroidManifest } from "expo/config-plugins";

const plugin: ConfigPlugin = (config) => {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app) return config;

    app.$["android:launchMode"] = "singleTask";
    app.$["android:enableOnBackInvokedCallback"] = "false";

    const activity = app.activity?.[0];
    if (!activity) return config;

    if (!activity["intent-filter"]) activity["intent-filter"] = [];

    activity["intent-filter"].push({
      action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
      data: [{ $: { "android:scheme": "magnet" } }],
      category: [
        { $: { "android:name": "android.intent.category.DEFAULT" } },
        { $: { "android:name": "android.intent.category.BROWSABLE" } },
      ],
    });

    activity["intent-filter"].push({
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
            "android:pathPattern": ".*\\.torrent",
          },
        },
      ],
      category: [
        { $: { "android:name": "android.intent.category.DEFAULT" } },
        { $: { "android:name": "android.intent.category.BROWSABLE" } },
      ],
    });

    activity["intent-filter"].push({
      action: [{ $: { "android:name": "android.intent.action.SEND" } }],
      data: [{ $: { "android:mimeType": "application/x-bittorrent" } }],
      category: [{ $: { "android:name": "android.intent.category.DEFAULT" } }],
    });

    return config;
  });
};

export default plugin;
