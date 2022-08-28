import AsyncStorage from "@react-native-async-storage/async-storage";

export type Server = {
  name: string;
  url: string;
  username?: string;
  password?: string;
};

export type ColorScheme = "system" | "dark" | "light";

export type Sort =
  | "queue"
  | "activity"
  | "age"
  | "name"
  | "progress"
  | "size"
  | "status"
  | "time-remaining"
  | "ratio";

export type Direction = "asc" | "desc";

export type Filter =
  | "all"
  | "active"
  | "downloading"
  | "seeding"
  | "paused"
  | "completed"
  | "finished";

export type Settings = {
  server?: Server;
  colorScheme: ColorScheme;
  listing: {
    sort: Sort;
    direction: Direction;
    filter: Filter;
  };
};

export const defaultSettings: Settings = {
  server: undefined,
  colorScheme: "system",
  listing: {
    sort: "queue",
    direction: "asc",
    filter: "all",
  },
};

const SETTINGS_KEY = "@settings";

export async function loadSettings(): Promise<Settings> {
  const value = await AsyncStorage.getItem(SETTINGS_KEY);
  if (value == null) {
    return defaultSettings;
  }

  const settings = JSON.parse(value) as Settings;
  return {
    ...defaultSettings,
    ...settings,
    listing: { ...defaultSettings.listing, ...settings.listing },
  };
}

export async function storeSettings(settings: Settings): Promise<void> {
  const value = JSON.stringify(settings);
  return await AsyncStorage.setItem(SETTINGS_KEY, value);
}
