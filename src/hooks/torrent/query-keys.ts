import type { TorrentId } from "~/client";
import type { Server } from "~/store/settings";

export const queryKeys = {
  torrents: (server: Server | undefined) =>
    ["torrents", server?.id, server?.url] as const,

  session: (server: Server | undefined) =>
    ["session", server?.id, server?.url] as const,

  sessionStats: (server: Server | undefined) =>
    ["session-stats", server?.id, server?.url] as const,

  torrentGet: (server: Server | undefined, id?: TorrentId) =>
    [
      ...queryKeys.torrents(server),
      "get",
      ...(id !== undefined ? [id] : []),
    ] as const,

  sessionGet: (server: Server | undefined) =>
    [...queryKeys.session(server), "get"] as const,

  configSession: (server: Server | undefined) =>
    ["config-session", server?.id, server?.url] as const,

  configPreferences: (server: Server | undefined) =>
    ["config-preferences", server?.id, server?.url] as const,

  serverScope: (server: Server | undefined) =>
    [server?.id, server?.url] as const,

  all: (server: Server | undefined) => queryKeys.serverScope(server),
} as const;

export const queryMatchers = {
  torrents: (server: Server | undefined) => ({
    queryKey: queryKeys.torrents(server),
  }),

  session: (server: Server | undefined) => ({
    queryKey: queryKeys.session(server),
  }),

  sessionStats: (server: Server | undefined) => ({
    queryKey: queryKeys.sessionStats(server),
  }),

  allForServer: (server: Server | undefined) => ({
    queryKey: queryKeys.all(server),
  }),
} as const;
