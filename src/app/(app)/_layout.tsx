import * as React from "react";
import * as Linking from "expo-linking";
import { Stack, useRouter, type Href } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useScreenOptions from "~/hooks/use-screen-options";
import { useServer } from "~/hooks/use-settings";

export default function AppLayout() {
  const router = useRouter();
  const server = useServer();
  const opts = useScreenOptions();

  const url = Linking.useLinkingURL();

  React.useEffect(() => {
    if (!server || url === null) {
      return;
    }

    let href: Href | null = null;

    const params = { magnet: url } as const;
    switch (true) {
      case url.startsWith("magnet:"):
        href = { pathname: "/add", params };
        break;
    }

    if (href === null || !href.params) {
      return;
    }

    router.push(href);
  }, [router, url, server]);

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack initialRouteName="index" screenOptions={opts}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: "Details",
            }}
          />
          <Stack.Screen
            name="add"
            options={{
              title: "Add torrent",
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
