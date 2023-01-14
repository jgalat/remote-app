import * as React from "react";
import {
  Settings,
  loadSettings,
  storeSettings,
  defaultSettings,
} from "../store/settings";

export type AppSettings = {
  settings: Settings;
  load: () => Promise<Settings>;
  store: (diff: Partial<Settings>) => Promise<void>;
};

export const SettingsContext = React.createContext<AppSettings | null>(null);

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const [settings, setSettings] = React.useReducer(
    (p: Settings, s: Partial<Settings>) => ({ ...p, ...s }),
    defaultSettings
  );

  const load = React.useCallback(async () => {
    const settings = await loadSettings();
    setSettings(settings);
    return settings;
  }, []);

  const store = React.useCallback(
    async (diff: Partial<Settings>) => {
      await storeSettings({ ...settings, ...diff });
      setSettings(diff);
    },
    [settings]
  );

  const value: AppSettings = {
    settings,
    load,
    store,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
