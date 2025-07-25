import * as React from "react";
import * as Linking from "expo-linking";
import { Stack, router, type Href } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useScreenOptions from "~/hooks/use-screen-options";
import { useServer } from "~/hooks/use-settings";

export default function AppLayout() {
  const server = useServer();
  const opts = useScreenOptions();

  const url = Linking.useLinkingURL();

  React.useEffect(() => {
    if (!server || url === null) {
      return;
    }

    let href: Href | null = null;

    const params = { uri: url } as const;
    switch (true) {
      case url.startsWith("magnet:"):
        href = { pathname: "/add/magnet", params };
        break;
    }

    if (href === null || !href.params) {
      return;
    }

    router.push(href);
  }, [url, server]);

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack initialRouteName="index" screenOptions={{ ...opts }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: "Details",
            }}
          />
          <Stack.Screen
            name="add/file"
            options={{
              title: "Import torrent file",
            }}
          />
          <Stack.Screen
            name="add/magnet"
            options={{
              title: "Import magnet URL",
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
