import * as React from "react";
import * as Linking from "expo-linking";
import * as DevClient from "expo-dev-client";
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
        <Stack screenOptions={opts}>
          <Stack.Screen name="index" options={{ title: "Remote" }} />
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
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="settings/connection"
            options={{ title: "Connection" }}
          />
          <Stack.Screen
            name="settings/configuration"
            options={{ title: "Server Configuration" }}
          />
          <Stack.Screen
            name="settings/security"
            options={{ title: "Security" }}
          />
          <Stack.Screen name="settings/theme" options={{ title: "Theme" }} />
          <Stack.Screen name="settings/about" options={{ title: "About" }} />
          {DevClient.isDevelopmentBuild() && (
            <Stack.Screen
              name="settings/development"
              options={{ title: "Development" }}
            />
          )}
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
