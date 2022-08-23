import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import { ActionSheetProvider } from "./contexts/action-sheet";
import Navigation from "./navigation";
import StatusBar from "./components/status-bar";

export default function App() {
  const loaded = useCachedResources();

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <ClientProvider>
          <SafeAreaProvider>
            <ActionSheetProvider>
              <Navigation />
              <StatusBar />
            </ActionSheetProvider>
          </SafeAreaProvider>
        </ClientProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
