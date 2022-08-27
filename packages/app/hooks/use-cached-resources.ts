import * as React from "react";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import useSettings from "./use-settings";

export default function useCachedResources() {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const { load: loadSettings } = useSettings();

  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await loadSettings();
        await Font.loadAsync({
          ...Feather.font,
          "RobotoMono-Regular": require("../assets/fonts/RobotoMono-Regular.ttf"),
          "RobotoMono-Medium": require("../assets/fonts/RobotoMono-Medium.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  React.useEffect(() => {
    async function hideSplashScreen() {
      if (!loaded) {
        return;
      }
      await SplashScreen.hideAsync();
    }

    hideSplashScreen();
  }, [loaded]);

  return loaded;
}
