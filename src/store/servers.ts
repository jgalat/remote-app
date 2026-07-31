import { randomUUID } from "expo-crypto";

import { storage } from "./storage";
import {
  ServersSchema,
  type Server,
  type ServersData,
  type ServerType,
} from "./server-schema";

export { ServersSchema, type Server, type ServersData, type ServerType };

export const LOCAL_SERVER_ID = "local";

const KEY = "user.servers";

const defaults: ServersData = {
  servers: [],
  activeServerId: undefined,
};

export function loadServers(): ServersData {
  const value = storage.getString(KEY);
  if (value === undefined) return defaults;

  try {
    const stored: unknown = JSON.parse(value);
    const result = ServersSchema.safeParse(stored);
    if (result.success) {
      if (JSON.stringify(stored) !== JSON.stringify(result.data)) {
        storeServers(result.data);
      }
      return result.data;
    }
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

export function getLocalServer(servers: Server[]): Server | undefined {
  return servers.find((s) => s.type === "local");
}
