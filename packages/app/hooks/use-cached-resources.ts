import * as React from "react";
import { Feather } from "@expo/vector-icons";
import * as Font from "expo-font";

export default function useCachedResources() {
  const [loaded, setLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        await Font.loadAsync({
          ...Feather.font,
          "roboto-mono": require("../assets/fonts/RobotoMono-Regular.ttf"),
          "roboto-mono_medium": require("../assets/fonts/RobotoMono-Medium.ttf"),
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
