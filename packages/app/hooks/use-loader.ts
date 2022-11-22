import * as React from "react";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";

import useSettings from "./use-settings";
import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
} from "../tasks/torrents-notifier";

export default function useCachedResources() {
  const [loaded, setLoaded] = React.useState(false);
  const { load: loadSettings } = useSettings();

  React.useEffect(() => {
    (async function () {
      try {
        await Font.loadAsync({
          ...Feather.font,
          "RobotoMono-Regular": require("../assets/fonts/RobotoMono-Regular.ttf"),
          "RobotoMono-Medium": require("../assets/fonts/RobotoMono-Medium.ttf"),
        });

        const storedSettings = await loadSettings();
        const taskRegistered = await isTorrentsNotifierTaskRegistered();

        if (storedSettings.notifications && !taskRegistered) {
          await registerTorrentsNotifierTask();
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return loaded;
}
