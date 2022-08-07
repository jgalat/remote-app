import * as React from "react";
import {
  useColorScheme as _useColorScheme,
  ColorSchemeName,
} from "react-native";
import {
  Settings,
  loadSettings,
  storeSettings,
  defaultSettings,
} from "../store/settings";

export type AppSettings = {
  settings: Settings;
  loading: boolean;
  load: () => Promise<void>;
  store: (settings: Settings) => Promise<void>;
};

const SettingsContext: React.Context<AppSettings> =
  React.createContext<AppSettings>({} as AppSettings);

export function SettingsProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);

  React.useEffect(() => {
    loadSettings().then((settings) => {
      setSettings(settings);
      setLoading(false);
    });
  }, []);

  const value: AppSettings = {
    settings,
    loading,
    load: async () => {
      setLoading(true);
      const settings = await loadSettings();
      setSettings(settings);
      setLoading(false);
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

export default function useSettings() {
  return React.useContext(SettingsContext);
}

export function useColorScheme() {
  const {
    settings: { colorScheme },
  } = useSettings();
  const systemColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  if (colorScheme == "system") {
    return systemColorScheme;
  }
  return colorScheme;
}

export function useServer() {
  return useSettings().settings.server;
}
