import * as React from "react";
import {
  useQueries,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import { createClient, type Session, type TorrentListItem } from "~/client";
import { useServers } from "~/hooks/use-settings";
import type { Server } from "~/store/settings";
import { queryKeys, torrentMutationKey } from "./query-keys";

export type ServerTorrent = {
  server: Server;
  torrent: TorrentListItem;
};

export type ServerConnectionError = {
  server: Server;
  error: Error;
};

type TorrentResults = UseQueryResult<TorrentListItem[], Error>[];
type SessionResults = UseQueryResult<Session, Error>[];

function combineSessions(results: SessionResults): Session[] {
  return results.flatMap((result) => (result.data ? [result.data] : []));
}

export function useAllTorrents({ stale = false }: { stale?: boolean } = {}) {
  const servers = useServers();
  const queryClient = useQueryClient();
  const combine = React.useCallback(
    (results: TorrentResults) => ({
      data: results.flatMap((result, index) =>
        (result.data ?? []).map((torrent) => ({
          server: servers[index],
          torrent,
        })),
      ),
      errors: results.flatMap((result, index) =>
        result.error ? [{ server: servers[index], error: result.error }] : [],
      ),
      isPending: results.some((result) => result.isPending),
    }),
    [servers],
  );

  const { data, errors, isPending } = useQueries({
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
        if (queryClient.isMutating({ mutationKey: torrentMutationKey })) {
          return false;
        }
        return 5_000;
      },
      staleTime: 5_000,
    })),
    combine,
  });

  const refetch = React.useCallback(
    () =>
      Promise.all(
        servers.map((server) =>
          queryClient.refetchQueries({ queryKey: queryKeys.torrentGet(server) }),
        ),
      ),
    [queryClient, servers],
  );

  return {
    data,
    errors,
    isLoading: data.length === 0 && isPending,
    refetch,
  };
}

export function useAllSessions({ stale = false }: { stale?: boolean } = {}) {
  const servers = useServers();
  return useQueries({
    queries: servers.map((server) => ({
      queryKey: queryKeys.sessionGet(server),
      queryFn: () => createClient(server).getSession(),
      enabled: !stale,
      staleTime: 5_000,
    })),
    combine: combineSessions,
  });
}
