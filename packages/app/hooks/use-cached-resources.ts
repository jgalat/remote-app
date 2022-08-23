import * as React from "react";
import { Feather } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function useCachedResources() {
  const [loaded, setLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Font.loadAsync({
          ...Feather.font,
          "roboto-mono": require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return loaded;
}
