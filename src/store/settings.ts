import { z } from "zod";
import { randomUUID } from "expo-crypto";

import { storage } from "./storage";

const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Server = z.infer<typeof ServerSchema>;

const ColorSchemeSchema = z.enum(["system", "dark", "light"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

const SortSchema = z.enum([
  "queue",
  "activity",
  "age",
  "name",
  "progress",
  "size",
  "status",
  "time-remaining",
  "ratio",
]);
export type Sort = z.infer<typeof SortSchema>;

const DirectionSchema = z.enum(["asc", "desc"]);
export type Direction = z.infer<typeof DirectionSchema>;

const FilterSchema = z.enum([
  "all",
  "active",
  "downloading",
  "seeding",
  "paused",
  "completed",
  "finished",
]);
export type Filter = z.infer<typeof FilterSchema>;

const SearchConfigSchema = z.object({
  url: z.string(),
  apiKey: z.string(),
  type: z.enum(["jackett", "prowlarr"]).default("jackett"),
});
export type SearchConfig = z.infer<typeof SearchConfigSchema>;

const ListingSchema = z.object({
  sort: SortSchema,
  direction: DirectionSchema,
  filter: FilterSchema,
});

const SettingsSchema = z.object({
  servers: z.array(ServerSchema),
  activeServerId: z.string().optional(),
  colorScheme: ColorSchemeSchema,
  authentication: z.boolean(),
  listing: ListingSchema,
  searchConfig: SearchConfigSchema.optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const defaultSettings: Settings = {
  servers: [],
  activeServerId: undefined,
  colorScheme: "system",
  authentication: false,
  listing: {
    sort: "queue",
    direction: "asc",
    filter: "all",
  },
};

const KEY = "user.settings";

const LegacyServerSchema = z.object({
  name: z.string(),
  url: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

const LegacySettingsSchema = z.object({
  server: LegacyServerSchema.optional(),
  colorScheme: ColorSchemeSchema.optional(),
  authentication: z.boolean().optional(),
  listing: ListingSchema.partial().optional(),
});

function generateId(): string {
  return randomUUID();
}

function migrateLegacy(legacy: z.infer<typeof LegacySettingsSchema>): Settings {
  const servers: Server[] = [];
  let activeServerId: string | undefined;

  if (legacy.server) {
    const now = Date.now();
    const id = generateId();
    servers.push({
      id,
      name: legacy.server.name,
      url: legacy.server.url,
      username: legacy.server.username,
      password: legacy.server.password,
      createdAt: now,
      updatedAt: now,
    });
    activeServerId = id;
  }

  return {
    ...defaultSettings,
    colorScheme: legacy.colorScheme ?? defaultSettings.colorScheme,
    authentication: legacy.authentication ?? defaultSettings.authentication,
    listing: { ...defaultSettings.listing, ...legacy.listing },
    servers,
    activeServerId,
  };
}

export function loadSettings(): Settings {
  const value = storage.getString(KEY);

  if (value === undefined) {
    return defaultSettings;
  }

  try {
    const json: unknown = JSON.parse(value);

    const modern = SettingsSchema.safeParse(json);
    if (modern.success) {
      return modern.data;
    }

    const legacy = LegacySettingsSchema.safeParse(json);
    if (legacy.success) {
      const migrated = migrateLegacy(legacy.data);
      storeSettings(migrated);
      return migrated;
    }

    storeSettings(defaultSettings);
    return defaultSettings;
  } catch {
    storeSettings(defaultSettings);
    return defaultSettings;
  }
}

export function storeSettings(settings: Settings): void {
  const value = JSON.stringify(settings);
  return storage.set(KEY, value);
}

export function getActiveServer(settings: Settings): Server | undefined {
  if (settings.servers.length === 0) return undefined;
  if (!settings.activeServerId) return settings.servers[0];
  return (
    settings.servers.find((s) => s.id === settings.activeServerId) ??
    settings.servers[0]
  );
}

export function generateServerId(): string {
  return generateId();
}
