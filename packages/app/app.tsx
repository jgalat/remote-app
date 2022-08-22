import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PortalProvider, PortalHost } from "@gorhom/portal";

import AnimatedSplash from "./components/animated-splash";
import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
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
          <AnimatedSplash>
            <SafeAreaProvider>
              <PortalProvider>
                <Navigation />
                <StatusBar />
                <PortalHost name="Root" />
              </PortalProvider>
            </SafeAreaProvider>
          </AnimatedSplash>
        </ClientProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
