import * as React from "react";
import * as Font from "expo-font";
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
} from "@expo-google-fonts/roboto-mono";
import { Feather } from "@expo/vector-icons";

import useSettings from "./use-settings";
import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
} from "../tasks/torrents-notifier";

export default function useLoader() {
  const [loaded, setLoaded] = React.useState(false);
  const { load: loadSettings } = useSettings();

  React.useEffect(() => {
    (async function () {
      try {
        await Font.loadAsync({
          ...Feather.font,
          "RobotoMono-Regular": RobotoMono_400Regular,
          "RobotoMono-Medium": RobotoMono_500Medium,
        });

        await loadSettings();

        if (!(await isTorrentsNotifierTaskRegistered())) {
          await registerTorrentsNotifierTask();
        }
      } catch {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, [loadSettings]);

  return loaded;
}
