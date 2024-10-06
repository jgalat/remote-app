import * as React from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { Redirect, Stack } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";
import { router } from "expo-router";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useAuth from "~/hooks/use-auth";
import useScreenOptions from "~/hooks/use-screen-options";
import { useServer } from "~/hooks/use-settings";

export default function AppLayout() {
  const { lock } = useAuth();
  const server = useServer();
  const opts = useScreenOptions();

  React.useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  React.useEffect(() => {
    if (lock || !server) {
      return;
    }

    const handle = ({ url }: { url: string }) => {
      switch (true) {
        case url.startsWith("magnet:"):
          router.push({ pathname: "/add/magnet", params: { uri: url } });
          break;
        case url.endsWith(".torrent"):
          router.push({ pathname: "/add/file", params: { uri: url } });
          break;
      }
    };

    const sub = Linking.addEventListener("url", handle);

    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) {
        handle({ url: initial });
      }
    })();

    return () => {
      sub.remove();
    };
  }, [lock, server]);

  if (lock) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack initialRouteName="index" screenOptions={opts}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: "Details",
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
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
