import * as React from "react";
import { createClient, type TorrentClient } from "~/client";
import { useServer } from "~/hooks/use-settings";
import type { Server } from "~/store/settings";

export function useClient(): TorrentClient | null {
  const server = useServer();
  return React.useMemo(() => {
    if (!server) return null;
    return createClient(server);
  }, [server]);
}

export function useServerClient(server: Server | undefined): TorrentClient | null {
  return React.useMemo(() => {
    if (!server) return null;
    return createClient(server);
  }, [server]);
}
