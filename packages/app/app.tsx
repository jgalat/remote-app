import * as React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { ActionSheetProvider } from "./contexts/action-sheet";
import Navigation from "./navigation";
import View from "./components/view";
import StatusBar from "./components/status-bar";

SplashScreen.preventAutoHideAsync();

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
          <App />
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
