import type { TorrentClient } from "./interface";

export function createUnavailableClient(fail: () => never): TorrentClient {
  return {
    async getTorrents() {
      return [];
    },
    async getTorrentInfo() {
      return undefined;
    },
    async getTorrentSettings() {
      return undefined;
    },
    async getTorrentFiles() {
      return undefined;
    },
    async getTorrentPeers() {
      return undefined;
    },
    async getTorrentTrackers() {
      return undefined;
    },
    addTorrent: async () => fail(),
    removeTorrents: async () => fail(),
    startTorrents: async () => fail(),
    startTorrentsNow: async () => fail(),
    stopTorrents: async () => fail(),
    verifyTorrents: async () => fail(),
    reannounceTorrents: async () => fail(),
    setTorrent: async () => fail(),
    setLocation: async () => fail(),
    renamePath: async () => fail(),
    queueMoveTop: async () => fail(),
    queueMoveUp: async () => fail(),
    queueMoveDown: async () => fail(),
    queueMoveBottom: async () => fail(),
    getSession: async () => fail(),
    setSession: async () => fail(),
    async getPreferences() {
      return {};
    },
    setPreferences: async () => fail(),
    async getSessionStats() {
      return {
        activeTorrentCount: 0,
        pausedTorrentCount: 0,
        torrentCount: 0,
        downloadSpeed: 0,
        uploadSpeed: 0,
      };
    },
    ping: async () => fail(),
  };
}
