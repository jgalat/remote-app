import { SafeAreaProvider } from "react-native-safe-area-context";

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
    <SettingsProvider>
      <ClientProvider>
        <AnimatedSplash>
          <SafeAreaProvider>
            <Navigation />
            <StatusBar />
          </SafeAreaProvider>
        </AnimatedSplash>
      </ClientProvider>
    </SettingsProvider>
  );
}
