import * as SystemUI from "expo-system-ui";
import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["app-resources"],
    queryFn: () => load(colorScheme),
  });

  return !isLoading;
}
