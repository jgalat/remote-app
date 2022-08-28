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

export type Settings = {
  server?: Server;
  colorScheme: ColorScheme;
  sort: Sort;
  direction: Direction;
};

export const defaultSettings: Settings = {
  server: undefined,
  colorScheme: "system",
  sort: "queue",
  direction: "asc",
};

const SETTINGS_KEY = "@settings";

export async function loadSettings(): Promise<Settings> {
  const value = await AsyncStorage.getItem(SETTINGS_KEY);
  if (value == null) {
    return defaultSettings;
  }

  return JSON.parse(value) as Settings;
}

export async function storeSettings(settings: Settings): Promise<void> {
  const value = JSON.stringify(settings);
  return await AsyncStorage.setItem(SETTINGS_KEY, value);
}
