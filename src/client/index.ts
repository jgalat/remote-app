export * from "./types";
export type { TorrentClient } from "./interface";

import type { TorrentClient } from "./interface";
import { TransmissionAdapter } from "./transmission";
import { QBittorrentAdapter } from "./qbittorrent";
import MockClient, { isTestingServer } from "~/utils/mock-transmission-client";
import type { Server } from "~/store/servers";

const cache = new Map<string, { client: TorrentClient; updatedAt: number }>();

export function createClient(server: Server): TorrentClient {
  if (isTestingServer(server)) return new MockClient();

  const cached = cache.get(server.id);
  if (cached && cached.updatedAt === server.updatedAt) {
    return cached.client;
  }

  let client: TorrentClient;
  switch (server.type) {
    case "qbittorrent":
      client = new QBittorrentAdapter(server);
      break;
    case "transmission":
    default:
      client = new TransmissionAdapter(server);
      break;
  }

  cache.set(server.id, { client, updatedAt: server.updatedAt });
  return client;
}
