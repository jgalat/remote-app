import * as React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { ActionSheetProvider } from "./contexts/action-sheet";
import Navigation from "./navigation";
import View from "./components/view";
import StatusBar from "./components/status-bar";

import "./tasks/torrents-notifier";

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
    <View style={styles.container}>
      <ActionSheetProvider>
        <Navigation />
        <StatusBar />
      </ActionSheetProvider>
    </View>
  );
}

export default function () {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SettingsProvider>
        <ClientProvider>
          <SafeAreaProvider>
            <App />
          </SafeAreaProvider>
        </ClientProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
