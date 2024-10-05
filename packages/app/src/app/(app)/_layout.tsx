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
    return <Redirect href="sign-in" />;
  }

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack screenOptions={opts} />
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
