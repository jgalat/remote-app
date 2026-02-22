import {
  TorrentStatus,
  Priority,
  type TorrentId,
  type Torrent,
  type ExtTorrent,
  type AddTorrentResult,
  type SetTorrentParams,
  type Session,
  type SessionStats,
} from "~/client/types";
import type { TorrentClient } from "~/client/interface";

const storage: {
  torrents: ExtTorrent[];
  session: Session & Record<string, unknown>;
  sessionStats: SessionStats;
} = {
  torrents: [
    {
      activityDate: 1757942622,
      addedDate: 1756848746,
      bandwidthPriority: 0,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadLimit: 100,
      downloadLimited: false,
      downloadedEver: 1223458816,
      error: 0,
      errorString: "",
      eta: -1,
      fileStats: [{ bytesCompleted: 1223458816, priority: 0, wanted: true }],
      files: [
        {
          bytesCompleted: 1223458816,
          length: 1378795520,
          name: "archlinux-2025.08.01-x86_64.iso",
        },
      ],
      honorsSessionLimits: true,
      id: 1,
      isFinished: false,
      leftUntilDone: 155336704,
      magnetLink:
        "magnet:?xt=urn:btih:ffb48118162732c8f56ad3e5a5612f2dd1a2be72&dn=archlinux-2025.08.01-x86_64.iso",
      name: "archlinux-2025.08.01-x86_64.iso",
      peers: [],
      peersConnected: 0,
      peersGettingFromUs: 0,
      peersSendingToUs: 0,
      percentDone: 0.8873,
      pieceCount: 2630,
      pieceSize: 524288,
      pieces: "",
      queuePosition: 0,
      rateDownload: 0,
      rateUpload: 0,
      recheckProgress: 0,
      seedIdleLimit: 30,
      seedIdleMode: 0,
      seedRatioLimit: 2,
      seedRatioMode: 0,
      sizeWhenDone: 1378795520,
      status: TorrentStatus.STOPPED,
      totalSize: 1378795520,
      trackerStats: [],
      uploadLimit: 100,
      uploadLimited: false,
      uploadRatio: 0,
      uploadedEver: 0,
      webseedsSendingToUs: 0,
    },
    {
      activityDate: 1761505588,
      addedDate: 1761505406,
      bandwidthPriority: 0,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadLimit: 100,
      downloadLimited: false,
      downloadedEver: 1836695896,
      error: 0,
      errorString: "",
      eta: -1,
      fileStats: [
        { bytesCompleted: 1836693504, priority: 0, wanted: true },
        { bytesCompleted: 2392, priority: 0, wanted: true },
      ],
      files: [
        {
          bytesCompleted: 1836693504,
          length: 5028886528,
          name: "Fedora-Astronomy_KDE-Live-x86_64-43_Beta/Fedora-Astronomy_KDE-Live-x86_64-43_Beta-1.3.iso",
        },
        {
          bytesCompleted: 2392,
          length: 2392,
          name: "Fedora-Astronomy_KDE-Live-x86_64-43_Beta/Fedora-Labs-iso-43_Beta-1.3-x86_64-CHECKSUM",
        },
      ],
      honorsSessionLimits: true,
      id: 2,
      isFinished: false,
      leftUntilDone: 3192193024,
      magnetLink:
        "magnet:?xt=urn:btih:01c79c0d83e3a084779f885313bf192427aaebdb&dn=Fedora-Astronomy_KDE-Live-x86_64-43_Beta&tr=http%3A%2F%2Ftorrent.fedoraproject.org%3A6969%2Fannounce",
      name: "Fedora-Astronomy_KDE-Live-x86_64-43_Beta",
      peers: [],
      peersConnected: 0,
      peersGettingFromUs: 0,
      peersSendingToUs: 0,
      percentDone: 0.3652,
      pieceCount: 19184,
      pieceSize: 262144,
      pieces: "",
      queuePosition: 1,
      rateDownload: 245000,
      rateUpload: 0,
      recheckProgress: 0,
      seedIdleLimit: 30,
      seedIdleMode: 0,
      seedRatioLimit: 6.5,
      seedRatioMode: 0,
      sizeWhenDone: 5028888920,
      status: TorrentStatus.STOPPED,
      totalSize: 5028888920,
      trackerStats: [
        {
          announce: "http://torrent.fedoraproject.org:6969/announce",
          tier: 0,
          seederCount: 29,
          leecherCount: 2,
          downloadCount: 114,
          lastAnnounceTime: 1761505577,
          lastAnnounceSucceeded: true,
          lastAnnouncePeerCount: 31,
          lastAnnounceResult: "Success",
          nextAnnounceTime: 0,
          lastScrapeTime: 1761505577,
          lastScrapeSucceeded: true,
          lastScrapeResult: "",
          nextScrapeTime: 1761507380,
          scrape: "http://torrent.fedoraproject.org:6969/scrape",
        },
      ],
      uploadLimit: 100,
      uploadLimited: false,
      uploadRatio: 0,
      uploadedEver: 0,
      webseedsSendingToUs: 0,
    },
  ],
  session: {
    "alt-speed-down": 50,
    "alt-speed-enabled": false,
    "alt-speed-up": 50,
    "alt-speed-time-enabled": false,
    "alt-speed-time-begin": 540,
    "alt-speed-time-end": 1020,
    "alt-speed-time-day": 127,
    seedRatioLimited: false,
    seedRatioLimit: 2,
    "idle-seeding-limit-enabled": false,
    "idle-seeding-limit": 30,
    "download-queue-enabled": true,
    "download-queue-size": 5,
    "seed-queue-enabled": false,
    "seed-queue-size": 10,
    "dht-enabled": true,
    "lpd-enabled": false,
    "pex-enabled": true,
    "download-dir": "/downloads/complete",
    "speed-limit-down-enabled": false,
    "speed-limit-down": 100,
    "speed-limit-up-enabled": false,
    "speed-limit-up": 100,
  },
  sessionStats: {
    activeTorrentCount: 0,
    pausedTorrentCount: 2,
    torrentCount: 2,
    downloadSpeed: 0,
    uploadSpeed: 0,
  },
};

export function isTestingServer(server: { name: string; url: string }): boolean {
  return server.name === "app" && server.url === "app-testing-url";
}

function stripExtended(t: ExtTorrent): Torrent {
  return {
    id: t.id,
    name: t.name,
    status: t.status,
    percentDone: t.percentDone,
    rateDownload: t.rateDownload,
    rateUpload: t.rateUpload,
    totalSize: t.totalSize,
    sizeWhenDone: t.sizeWhenDone,
    leftUntilDone: t.leftUntilDone,
    eta: t.eta,
    error: t.error,
    errorString: t.errorString,
    isFinished: t.isFinished,
    peersConnected: t.peersConnected,
    peersGettingFromUs: t.peersGettingFromUs,
    peersSendingToUs: t.peersSendingToUs,
    webseedsSendingToUs: t.webseedsSendingToUs,
    uploadedEver: t.uploadedEver,
    uploadRatio: t.uploadRatio,
    recheckProgress: t.recheckProgress,
    queuePosition: t.queuePosition,
    addedDate: t.addedDate,
    doneDate: t.doneDate,
    activityDate: t.activityDate,
    magnetLink: t.magnetLink,
    downloadDir: t.downloadDir,
  };
}

export default class MockClient implements TorrentClient {
  async getTorrents(): Promise<Torrent[]> {
    return storage.torrents.map(stripExtended);
  }

  async getTorrent(id: TorrentId): Promise<ExtTorrent | undefined> {
    return storage.torrents.find((t) => t.id == id);
  }

  async addTorrent(): Promise<AddTorrentResult | null> {
    return null;
  }

  async removeTorrents(ids: TorrentId[]): Promise<void> {
    storage.torrents = storage.torrents.filter((t) => !ids.includes(t.id));
  }

  async startTorrents(ids: TorrentId[]): Promise<void> {
    this.setStatus(ids, TorrentStatus.DOWNLOADING);
  }

  async startTorrentsNow(ids: TorrentId[]): Promise<void> {
    this.setStatus(ids, TorrentStatus.DOWNLOADING);
  }

  async stopTorrents(ids: TorrentId[]): Promise<void> {
    this.setStatus(ids, TorrentStatus.STOPPED);
  }

  async verifyTorrents(ids: TorrentId[]): Promise<void> {
    this.setStatus(ids, TorrentStatus.VERIFYING_LOCAL_DATA);
  }

  async reannounceTorrents(): Promise<void> {}

  async setTorrent(ids: TorrentId[], params: SetTorrentParams): Promise<void> {
    const id = ids[0];
    storage.torrents = storage.torrents.map((torrent) => {
      if (torrent.id != id) return torrent;

      const fs = [...torrent.fileStats];
      for (const i of params["files-wanted"] ?? []) fs[i] = { ...fs[i], wanted: true };
      for (const i of params["files-unwanted"] ?? []) fs[i] = { ...fs[i], wanted: false };
      for (const i of params["priority-low"] ?? []) fs[i] = { ...fs[i], priority: Priority.LOW };
      for (const i of params["priority-normal"] ?? []) fs[i] = { ...fs[i], priority: Priority.NORMAL };
      for (const i of params["priority-high"] ?? []) fs[i] = { ...fs[i], priority: Priority.HIGH };

      return { ...torrent, fileStats: fs };
    });
  }

  async setLocation(): Promise<void> {}
  async queueMoveTop(): Promise<void> {}
  async queueMoveUp(): Promise<void> {}
  async queueMoveDown(): Promise<void> {}
  async queueMoveBottom(): Promise<void> {}

  async getSession(): Promise<Session> {
    return storage.session;
  }

  async setSession(params: Partial<Session>): Promise<void> {
    Object.assign(storage.session, params);
  }

  async getPreferences(): Promise<Record<string, unknown>> {
    return {};
  }

  async setPreferences(): Promise<void> {}

  async getSessionStats(): Promise<SessionStats> {
    return storage.sessionStats;
  }

  async ping(): Promise<void> {}

  private setStatus(ids: TorrentId[], status: TorrentStatus): void {
    storage.torrents = storage.torrents.map((t) =>
      ids.includes(t.id) ? { ...t, status } : t,
    );
  }
}
