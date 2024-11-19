import { storage } from "./storage";

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
  authentication: boolean;
  listing: {
    sort: Sort;
    direction: Direction;
    filter: Filter;
  };
};

export const defaultSettings: Settings = {
  server: undefined,
  colorScheme: "system",
  authentication: false,
  listing: {
    sort: "queue",
    direction: "asc",
    filter: "all",
  },
};

const KEY = "user.settings";

export function loadSettings(): Settings {
  const value = storage.getString(KEY);

  if (value === undefined) {
    return defaultSettings;
  }

  try {
    const settings = JSON.parse(value) as Settings;
    return {
      ...defaultSettings,
      ...settings,
      listing: { ...defaultSettings.listing, ...settings.listing },
    };
  } catch {
    storeSettings(defaultSettings);
    return defaultSettings;
  }
}

export function storeSettings(settings: Settings): void {
  const value = JSON.stringify(settings);
  return storage.set(KEY, value);
}
