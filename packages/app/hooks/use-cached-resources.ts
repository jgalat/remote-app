import * as React from "react";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import useSettings from "./use-settings";
import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
} from "../tasks/torrents-notifier";

export default function useCachedResources() {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const { load: loadSettings } = useSettings();

  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        const storedSettings = await loadSettings();
        const taskRegistered = await isTorrentsNotifierTaskRegistered();

        if (storedSettings.notifications && !taskRegistered) {
          await registerTorrentsNotifierTask();
        }

        await Font.loadAsync({
          ...Feather.font,
          "RobotoMono-Regular": require("../assets/fonts/RobotoMono-Regular.ttf"),
          "RobotoMono-Medium": require("../assets/fonts/RobotoMono-Medium.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
        setTimeout(() => SplashScreen.hideAsync(), 500);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return loaded;
}
