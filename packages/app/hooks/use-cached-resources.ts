import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function useCachedResources() {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        await Font.loadAsync({
          ...Feather.font,
          "roboto-mono": require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
        });
        console.log("AA");
        console.log(Constants.manifest);
        await Asset.loadAsync(require("../assets/images/splash.png"));
        console.log("BB");
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return { loading };
}
