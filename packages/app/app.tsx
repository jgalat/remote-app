import * as React from "react";
import { SheetProvider } from "react-native-actions-sheet";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import StatusBar from "./components/status-bar";
import Screen from "./components/screen";
import useLoader from "./hooks/use-loader";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { NavigationContainer, RootNavigator } from "./navigation";

import "./sheets";
import "./tasks";

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
      <SheetProvider>
        <RootNavigator />
      </SheetProvider>
    </NavigationContainer>
  );
}

export default function Providers() {
  return (
    <SettingsProvider>
      <ClientProvider>
        <App />
        <StatusBar />
      </ClientProvider>
    </SettingsProvider>
  );
}
