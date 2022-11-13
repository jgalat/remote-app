import * as React from "react";
import { SheetProvider } from "react-native-actions-sheet";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { NavigationContainer, RootNavigator } from "./navigation";
import StatusBar from "./components/status-bar";

import "./sheets";
import "./tasks";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function App() {
  const loaded = useCachedResources();

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <SheetProvider>
        <RootNavigator />
      </SheetProvider>
    </NavigationContainer>
  );
}

export default function () {
  return (
    <SettingsProvider>
      <ClientProvider>
        <App />
        <StatusBar />
      </ClientProvider>
    </SettingsProvider>
  );
}
