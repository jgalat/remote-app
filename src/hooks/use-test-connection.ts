import { useMutation } from "@tanstack/react-query";

import type { ServerType } from "~/store/settings";
import { isTestingServer } from "~/utils/mock-transmission-client";
import { TransmissionAdapter } from "~/client/transmission";
import { QBittorrentAdapter } from "~/client/qbittorrent";

type TestConnectionParams = {
  type: ServerType;
  name: string;
  url: string;
  username?: string;
  password?: string;
};

async function testConnection(params: TestConnectionParams): Promise<string> {
  if (isTestingServer(params)) {
    return "Connected";
  }

  const config = { url: params.url, username: params.username, password: params.password };
  const client =
    params.type === "qbittorrent"
      ? new QBittorrentAdapter(config)
      : new TransmissionAdapter(config);

  try {
    await client.ping();
    return "Connected";
  } catch (e) {
    if (e instanceof Error) {
      return `Error: ${e.message}`;
    }
    return "Unknown error";
  }
}

export function useTestConnection() {
  return useMutation({ mutationFn: testConnection });
}
