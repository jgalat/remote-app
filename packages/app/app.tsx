import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/use-cached-resources";
import { SettingsProvider } from "./hooks/use-settings";
import Navigation from "./navigation";

import StatusBar from "./components/status-bar";

export default function App() {
  const resourcesLoaded = useCachedResources();

  if (!resourcesLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar />
      </SafeAreaProvider>
    </SettingsProvider>
  );
}
