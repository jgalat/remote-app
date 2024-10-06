import * as React from "react";
import * as SplashScreen from "expo-splash-screen";
import { Redirect, Stack } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useAuth from "~/hooks/use-auth";
import useScreenOptions from "~/hooks/use-screen-options";

export default function AppLayout() {
  const { lock } = useAuth();
  const opts = useScreenOptions();

  React.useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  if (lock) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack initialRouteName="index" screenOptions={opts}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="add/file"
            options={{
              title: "Import torrent file",
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="add/magnet"
            options={{
              title: "Import magnet URL",
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: false, animation: "slide_from_bottom" }}
          />
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
