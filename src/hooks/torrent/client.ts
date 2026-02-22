import { createClient, type TorrentClient } from "~/client";
import { useServer } from "../use-settings";
import type { Server } from "~/store/settings";

export function useClient(): TorrentClient | null {
  const server = useServer();
  if (!server) return null;
  return createClient(server);
}

export function useServerClient(server: Server | undefined): TorrentClient | null {
  if (!server) return null;
  return createClient(server);
}
