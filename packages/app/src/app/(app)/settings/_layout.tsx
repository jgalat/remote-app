import * as React from "react";
import { Stack } from "expo-router";

import useScreenOptions from "~/hooks/use-screen-options";

export default function SettingsLayout() {
  const opts = useScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...opts,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="connection" options={{ title: "Connection" }} />
      <Stack.Screen name="configuration" options={{ title: "Server Configuration" }} />
      <Stack.Screen name="security" options={{ title: "Security" }} />
      <Stack.Screen name="theme" options={{ title: "Theme" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
    </Stack>
  );
}
