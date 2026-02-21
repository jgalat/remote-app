import { z } from "zod";
import { randomUUID } from "expo-crypto";

import { storage } from "./storage";

const ServerTypeSchema = z.enum(["transmission", "qbittorrent"]);
export type ServerType = z.infer<typeof ServerTypeSchema>;

const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  type: ServerTypeSchema.default("transmission"),
  username: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Server = z.infer<typeof ServerSchema>;

const ServersSchema = z.object({
  servers: z.array(ServerSchema),
  activeServerId: z.string().optional(),
});

type ServersData = z.infer<typeof ServersSchema>;

const KEY = "user.servers";

const defaults: ServersData = {
  servers: [],
  activeServerId: undefined,
};

export function loadServers(): ServersData {
  const value = storage.getString(KEY);
  if (value === undefined) return defaults;

  try {
    const result = ServersSchema.safeParse(JSON.parse(value));
    if (result.success) return result.data;
    storeServers(defaults);
    return defaults;
  } catch {
    storeServers(defaults);
    return defaults;
  }
}

export function storeServers(data: ServersData): void {
  storage.set(KEY, JSON.stringify(data));
}

export function getActiveServer(settings: {
  servers: Server[];
  activeServerId?: string;
}): Server | undefined {
  if (settings.servers.length === 0) return undefined;
  if (!settings.activeServerId) return settings.servers[0];
  return (
    settings.servers.find((s) => s.id === settings.activeServerId) ??
    settings.servers[0]
  );
}

export function generateServerId(): string {
  return randomUUID();
}
