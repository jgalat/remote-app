import * as React from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";

import type { TorrentClient } from "~/client";
import type { Server } from "~/store/settings";
import { useServerClient } from "./client";
import { queryKeys } from "./query-keys";

export type DirectoryFreeSpace =
  | { status: "loading" }
  | { status: "available"; bytes: number }
  | { status: "unavailable" };

const STALE_TIME = 30_000;

function supportsFreeSpace(
  server: Server | undefined,
  client: TorrentClient | null,
  path: string,
  defaultPath: string | undefined,
): boolean {
  if (!server || !client?.getFreeSpace || server.type === "local") return false;
  if (server.type !== "qbittorrent") return true;
  return path === defaultPath;
}

function queryOptions(
  server: Server | undefined,
  client: TorrentClient,
  path: string,
) {
  return {
    queryKey: queryKeys.freeSpace(server, path),
    queryFn: async (): Promise<number | null> => {
      try {
        const bytes = await client.getFreeSpace?.(path);
        if (bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
          return null;
        }
        return bytes;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: STALE_TIME,
  };
}

export function useDirectoryFreeSpace(
  server: Server | undefined,
  paths: string[],
  defaultPath: string | undefined,
) {
  const client = useServerClient(server);
  const queryClient = useQueryClient();
  const supportedPaths = React.useMemo(
    () =>
      [...new Set(paths)].filter((path) =>
        supportsFreeSpace(server, client, path, defaultPath),
      ),
    [client, defaultPath, paths, server],
  );

  const queries = useQueries({
    queries: supportedPaths.map((path) =>
      queryOptions(server, client as TorrentClient, path),
    ),
  });

  const spaces = React.useMemo<Record<string, DirectoryFreeSpace>>(() => {
    const result: Record<string, DirectoryFreeSpace> = {};
    for (let i = 0; i < supportedPaths.length; i++) {
      const data = queries[i].data;
      result[supportedPaths[i]] =
        data === undefined
          ? { status: "loading" }
          : data === null
            ? { status: "unavailable" }
            : { status: "available", bytes: data };
    }
    return result;
  }, [queries, supportedPaths]);

  const load = React.useCallback(async () => {
    const entries = await Promise.all(
      supportedPaths.map(async (path) => {
        const data = await queryClient.fetchQuery(
          queryOptions(server, client as TorrentClient, path),
        );
        const state: DirectoryFreeSpace =
          data === null
            ? { status: "unavailable" }
            : { status: "available", bytes: data };
        return [path, state] as const;
      }),
    );
    return Object.fromEntries(entries) as Record<string, DirectoryFreeSpace>;
  }, [client, queryClient, server, supportedPaths]);

  return { spaces, load };
}
