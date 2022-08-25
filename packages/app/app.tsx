import * as React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { ActionSheetProvider } from "./contexts/action-sheet";
import Navigation from "./navigation";
import StatusBar from "./components/status-bar";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const loaded = useCachedResources();
  const onReady = React.useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <SettingsProvider>
        <ClientProvider>
          <SafeAreaProvider>
            <ActionSheetProvider>
              <Navigation onReady={onReady} />
              <StatusBar />
            </ActionSheetProvider>
          </SafeAreaProvider>
        </ClientProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
