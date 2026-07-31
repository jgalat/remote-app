export * from "./types";
export type { TorrentClient } from "./interface";

import type { TorrentClient } from "./interface";
import { TransmissionAdapter } from "./transmission";
import { QBittorrentAdapter } from "./qbittorrent";
import MockClient, { isTestingServer } from "~/utils/mock-transmission-client";
import type { Server } from "~/store/servers";
import { createFailoverClient } from "./failover";

const cache = new Map<string, { client: TorrentClient; updatedAt: number }>();

function createAdapter(server: Server, url: string): TorrentClient {
  const config = {
    ...server,
    url,
    requestTimeoutMs: server.connectionTimeoutMs,
  };

  switch (server.type) {
    case "qbittorrent":
      return new QBittorrentAdapter(config);
    case "local": {
      // Lazy-required so the open-source build (with the stub package)
      // doesn't pull native bindings into its module graph.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createLocalTorrentClient } = require("@remote-app/pro");
      return createLocalTorrentClient(server);
    }
    case "transmission":
    default:
      return new TransmissionAdapter(config);
  }
}

export function createClient(server: Server): TorrentClient {
  if (isTestingServer(server)) return new MockClient();

  const cached = cache.get(server.id);
  if (cached && cached.updatedAt === server.updatedAt) {
    return cached.client;
  }

  const urls = [server.url, ...server.alternativeUrls];
  const clients = urls.map((url) => createAdapter(server, url));
  const client =
    server.type !== "local" && clients.length > 1
      ? createFailoverClient(clients)
      : clients[0];

  cache.set(server.id, { client, updatedAt: server.updatedAt });
  return client;
}
