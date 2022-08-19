import { Feather } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { useEffect, useState } from "react";

export default function useCachedResources() {
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Asset.loadAsync(require("../assets/images/splash.png"));
        await Font.loadAsync({
          ...Feather.font,
          "roboto-mono": require("../assets/fonts/RobotoMono-VariableFont_wght.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return loaded;
}
