import * as React from "react";
import { useColorScheme as _useColorScheme } from "react-native";
import {
  Settings,
  loadSettings,
  storeSettings,
  defaultSettings,
} from "../store/settings";

export type AppSettings = {
  settings: Settings;
  load: () => Promise<Settings>;
  store: (settings: Settings) => Promise<void>;
};

export const SettingsContext: React.Context<AppSettings> =
  React.createContext<AppSettings>({} as AppSettings);

export function SettingsProvider({
  children,
}: Omit<React.ComponentProps<typeof SettingsContext.Provider>, "value">) {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);

  const value: AppSettings = {
    settings,
    load: async () => {
      const settings = await loadSettings();
      setSettings(settings);
      return settings;
    },
    store: async (settings: Settings) => {
      await storeSettings(settings);
      setSettings(settings);
    },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
