import * as SystemUI from "expo-system-ui";
import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";

import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
} from "~/tasks/torrents-notifier";
import { useColorScheme } from "./use-settings";
import colors from "~/constants/colors";

async function load(
  colorScheme: ReturnType<typeof useColorScheme>
): Promise<boolean> {
  try {
    await SystemUI.setBackgroundColorAsync(colors[colorScheme].background);
    await Notifications.requestPermissionsAsync();
    if (!(await isTorrentsNotifierTaskRegistered())) {
      await registerTorrentsNotifierTask();
    }
  } catch {
    // ignore
  }

  return true;
}

export default function useLoader() {
  const colorScheme = useColorScheme();

  const { isLoading } = useQuery({
    queryKey: ["app-resources"] as const,
    queryFn: () => load(colorScheme),
  });

  return !isLoading;
}
