import * as React from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";

import { createClient, type Session, type TorrentListItem } from "~/client";
import { useServers } from "~/hooks/use-settings";
import type { Server } from "~/store/settings";
import { queryKeys } from "./query-keys";

export type ServerTorrent = {
  server: Server;
  torrent: TorrentListItem;
};

export type ServerConnectionError = {
  server: Server;
  error: Error;
};

export function useAllTorrents({ stale = false }: { stale?: boolean } = {}) {
  const servers = useServers();
  const queryClient = useQueryClient();
  const queries = useQueries({
    queries: servers.map((server) => ({
      queryKey: queryKeys.torrentGet(server),
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const data = await createClient(server).getTorrents();
        if (signal.aborted) throw new Error("aborted");
        return data;
      },
      enabled: !stale,
      refetchInterval: (query: { state: { status: string } }) => {
        if (query.state.status === "error") return false;
        if (queryClient.isMutating()) return false;
        return 5_000;
      },
      staleTime: 5_000,
    })),
  });

  const data = React.useMemo<ServerTorrent[]>(
    () =>
      queries.flatMap((query, index) =>
        (query.data ?? []).map((torrent) => ({
          server: servers[index],
          torrent,
        })),
      ),
    [queries, servers],
  );

  const errors = React.useMemo<ServerConnectionError[]>(
    () =>
      queries.flatMap((query, index) =>
        query.error instanceof Error
          ? [{ server: servers[index], error: query.error }]
          : [],
      ),
    [queries, servers],
  );

  const refetch = React.useCallback(
    async () => Promise.all(queries.map((query) => query.refetch())),
    [queries],
  );

  return {
    data,
    errors,
    isLoading:
      data.length === 0 && queries.some((query) => query.isPending),
    refetch,
  };
}

export function useAllSessions({ stale = false }: { stale?: boolean } = {}) {
  const servers = useServers();
  const queries = useQueries({
    queries: servers.map((server) => ({
      queryKey: queryKeys.sessionGet(server),
      queryFn: () => createClient(server).getSession(),
      enabled: !stale,
      staleTime: 5_000,
    })),
  });

  return React.useMemo<Session[]>(
    () => queries.flatMap((query) => (query.data ? [query.data] : [])),
    [queries],
  );
}
