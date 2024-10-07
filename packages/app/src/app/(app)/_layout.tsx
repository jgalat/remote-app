import * as React from "react";
import * as Linking from "expo-linking";
import { Redirect, Stack, router, usePathname, type Href } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useAuth from "~/hooks/use-auth";
import useScreenOptions from "~/hooks/use-screen-options";
import { useServer } from "~/hooks/use-settings";

export default function AppLayout() {
  const { locked } = useAuth();
  const server = useServer();
  const opts = useScreenOptions();
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);

  const url = Linking.useURL();

  React.useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  React.useEffect(() => {
    if (locked || !server || url === null) {
      return;
    }

    console.log("Running effect", locked, url);

    let href: Href | null = null;

    const params = { uri: url } as const;
    switch (true) {
      case url.startsWith("magnet:"):
        href = { pathname: "/add/magnet", params };
        break;
      case url.startsWith("content:"):
        href = { pathname: "/add/file", params };
        break;
      case url.endsWith(".torrent"):
        href = { pathname: "/add/file", params };
        break;
    }

    if (href === null || !href.params) {
      return;
    }

    if (pathnameRef.current === href.pathname) {
      return router.setParams(href.params);
    }

    return router.push(href);
  }, [url, locked, server]);

  if (locked) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack
          initialRouteName="index"
          screenOptions={{ ...opts, animation: "slide_from_bottom" }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: "Details",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="add/file"
            options={{
              title: "Import torrent file",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="add/magnet"
            options={{
              title: "Import magnet URL",
              presentation: "modal",
            }}
          />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
