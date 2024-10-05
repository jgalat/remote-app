import * as React from "react";
import { router } from "expo-router";

import ActionIcon from "~/components/action-icon";
import { useTheme } from "./use-theme-color";

export default function useScreenOptions() {
  const { text, background } = useTheme();
  return {
    headerTitleStyle: {
      fontFamily: "RobotoMono-Medium",
      color: text,
    },
    headerStyle: {
      backgroundColor: background,
    },
    headerShadowVisible: false,
    headerLeft: () =>
      router.canGoBack() ? (
        <ActionIcon
          name="arrow-left"
          onPress={() => router.back()}
          style={{ paddingLeft: 0, paddingRight: 32 }}
        />
      ) : null,
  } as const;
}
