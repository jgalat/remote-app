import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./contexts/settings";
import { ClientProvider } from "./contexts/transmission-client";
import Navigation from "./navigation";

import StatusBar from "./components/status-bar";

export default function App() {
  const resourcesLoaded = useCachedResources();

  if (!resourcesLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <ClientProvider>
        <SafeAreaProvider>
          <Navigation />
          <StatusBar />
        </SafeAreaProvider>
      </ClientProvider>
    </SettingsProvider>
  );
}
