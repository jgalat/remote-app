import type { ServerType } from "~/store/settings";

export const typeDefaults: Record<ServerType, { port: number; path: string }> = {
  transmission: { port: 9091, path: "/transmission/rpc" },
  qbittorrent: { port: 8080, path: "" },
};

export function defaultPortForSSL(type: ServerType, useSSL: boolean): number {
  if (useSSL) return 443;
  return typeDefaults[type].port;
}
