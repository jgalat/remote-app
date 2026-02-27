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

export type TestConnectionResult = {
  connected: boolean;
  message: string;
  error?: {
    name: string;
    message: string;
    status?: number;
    body?: string;
  };
};

async function testConnection(params: TestConnectionParams): Promise<TestConnectionResult> {
  if (isTestingServer(params)) {
    return { connected: true, message: "Connected" };
  }

  const config = { url: params.url, username: params.username, password: params.password };
  const client =
    params.type === "qbittorrent"
      ? new QBittorrentAdapter(config)
      : new TransmissionAdapter(config);

  try {
    await client.ping();
    return { connected: true, message: "Connected" };
  } catch (e) {
    if (e instanceof Error) {
      const error: TestConnectionResult["error"] = {
        name: e.name,
        message: e.message,
      };
      if ("status" in e && typeof e.status === "number") error.status = e.status;
      if ("body" in e && typeof e.body === "string") error.body = e.body;
      const msg = error.status
        ? e.message ? `${error.status}: ${e.message}` : `HTTP ${error.status}`
        : e.message || "Unknown error";
      return { connected: false, message: msg, error };
    }
    return { connected: false, message: "Unknown error" };
  }
}

export function useTestConnection() {
  return useMutation({ mutationFn: testConnection });
}
