import type { Server } from "~/store/settings";

export const queryKeys = {
  torrents: (server: Server | undefined) => 
    ["torrents", server?.url, server?.username] as const,
  
  session: (server: Server | undefined) => 
    ["session", server?.url, server?.username] as const,
  
  sessionStats: (server: Server | undefined) => 
    ["session-stats", server?.url, server?.username] as const,
  
  freeSpace: (server: Server | undefined, downloadDir?: string) => 
    ["free-space", server?.url, server?.username, downloadDir] as const,

  torrentGet: (server: Server | undefined) => 
    [...queryKeys.torrents(server), "get"] as const,
  
  sessionGet: (server: Server | undefined) => 
    [...queryKeys.session(server), "get"] as const,

  serverScope: (server: Server | undefined) => 
    [server?.url, server?.username] as const,

  all: (server: Server | undefined) => 
    queryKeys.serverScope(server),
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
  
  freeSpace: (server: Server | undefined) => ({
    queryKey: queryKeys.freeSpace(server),
  }),

  allForServer: (server: Server | undefined) => ({
    queryKey: queryKeys.all(server),
  }),
} as const;
