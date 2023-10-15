import * as React from "react";
import * as Font from "expo-font";
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
} from "@expo-google-fonts/roboto-mono";
import { Feather, FontAwesome } from "@expo/vector-icons";

import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
} from "../tasks/torrents-notifier";

export default function useLoader() {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async function () {
      try {
        await Font.loadAsync({
          ...Feather.font,
          ...FontAwesome.font,
          "RobotoMono-Regular": RobotoMono_400Regular,
          "RobotoMono-Medium": RobotoMono_500Medium,
        });

        if (!(await isTorrentsNotifierTaskRegistered())) {
          await registerTorrentsNotifierTask();
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  return loaded;
}
