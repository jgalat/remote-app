import * as SystemUI from "expo-system-ui";
import { useQuery } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";

import { registerTorrentsNotifierTask } from "~/tasks/torrents-notifier";
import { useColorScheme } from "./use-settings";
import colors from "~/constants/colors";

async function load(
  colorScheme: ReturnType<typeof useColorScheme>
): Promise<boolean> {
  try {
    await SystemUI.setBackgroundColorAsync(colors[colorScheme].background);
    if (!(await Notifications.getPermissionsAsync()).granted) {
      await Notifications.requestPermissionsAsync();
    }
    await registerTorrentsNotifierTask();
  } catch {
    // ignore
  }

  return true;
}

export default function useLoader() {
  const colorScheme = useColorScheme();

  const { data } = useQuery({
    queryKey: ["app-resources"] as const,
    queryFn: () => load(colorScheme),
  });

  return !!data;
}
