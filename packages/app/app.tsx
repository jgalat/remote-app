import * as React from "react";
import { SheetProvider } from "react-native-actions-sheet";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import StatusBar from "./components/status-bar";
import Screen from "./components/screen";
import useLoader from "./hooks/use-loader";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { TorrentSelectionProvider } from "./contexts/torrent-selection";
import { NavigationContainer, RootNavigator } from "./navigation";

import "./tasks";
import "./sheets";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  const loaded = useLoader();

  const onLoad = React.useCallback(async () => {
    if (loaded) {
      await SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Screen />;
  }

  return (
    <NavigationContainer onReady={onLoad}>
      <TorrentSelectionProvider>
        <SheetProvider>
          <RootNavigator />
          <StatusBar />
        </SheetProvider>
      </TorrentSelectionProvider>
    </NavigationContainer>
  );
}

const queryClient = new QueryClient();

export default function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ClientProvider>
          <App />
        </ClientProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
