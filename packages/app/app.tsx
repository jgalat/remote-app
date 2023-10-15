import * as React from "react";
import { SheetProvider } from "react-native-actions-sheet";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import StatusBar from "./components/status-bar";
import Auth from "./components/auth";
import Screen from "./components/screen";
import useLoader from "./hooks/use-loader";
import useAuth from "./hooks/use-auth";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { TorrentSelectionProvider } from "./contexts/torrent-selection";
import { NavigationContainer, RootNavigator } from "./navigation";

import "./tasks";
import "./sheets";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
  const { locked, onAuth } = useAuth();

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
          <StatusBar />
          <RootNavigator />
          {locked && <Auth onAuth={onAuth} />}
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
          <SafeAreaProvider>
            <App />
          </SafeAreaProvider>
        </ClientProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
