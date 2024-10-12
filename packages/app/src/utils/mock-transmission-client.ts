import {
  FreeSpaceResponse,
  SessionGetResponse,
  SessionStatsResponse,
  SessionGetRequest,
  TorrentStatus,
  TorrentRemoveRequest,
} from "@remote-app/transmission-client";
import { Server } from "~/store/settings";

const storage = {
  torrents: [
    {
      activityDate: 1728666623,
      addedDate: 1728666580,
      comment: "",
      corruptEver: 0,
      creator: "",
      dateCreated: 0,
      desiredAvailable: 0,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadedEver: 143530676,
      error: 0,
      errorString: "",
      eta: -1,
      fileStats: [{ bytesCompleted: 143179776, priority: 0, wanted: true }],
      files: [
        {
          bytesCompleted: 143179776,
          length: 1173389312,
          name: "archlinux-2024.10.01-x86_64.iso",
        },
      ],
      hashString: "2bc1a95671255818ed38ea61cf2aa437e63053a6",
      haveUnchecked: 17317888,
      haveValid: 125861888,
      id: 6,
      isFinished: false,
      isPrivate: false,
      isStalled: false,
      leftUntilDone: 1030209536,
      magnetLink:
        "magnet:?xt=urn:btih:2bc1a95671255818ed38ea61cf2aa437e63053a6&dn=archlinux-2024.10.01-x86%5F64.iso",
      metadataPercentComplete: 1,
      name: "archlinux-2024.10.01-x86_64.iso",
      peers: [],
      peersConnected: 0,
      peersGettingFromUs: 0,
      peersSendingToUs: 0,
      percentDone: 0.122,
      pieceCount: 2239,
      pieceSize: 524288,
      queuePosition: 0,
      rateDownload: 0,
      rateUpload: 0,
      recheckProgress: 0,
      seedRatioLimit: 2,
      seedRatioMode: 0,
      sizeWhenDone: 1173389312,
      startDate: 1728666585,
      status: 0,
      totalSize: 1173389312,
      trackerStats: [],
      trackers: [],
      uploadRatio: 0,
      uploadedEver: 0,
      webseedsSendingToUs: 0,
    },
    {
      activityDate: 1728666820,
      addedDate: 1728666778,
      comment: "",
      corruptEver: 0,
      creator: "mktorrent 1.1",
      dateCreated: 1711024119,
      desiredAvailable: 2318188544,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadedEver: 163022013,
      error: 0,
      errorString: "",
      eta: 452,
      fileStats: [
        { bytesCompleted: 162867200, priority: 0, wanted: true },
        { bytesCompleted: 2562, priority: 0, wanted: true },
      ],
      files: [
        {
          bytesCompleted: 162867200,
          length: 2481055744,
          name: "Fedora-KDE-Live-x86_64-39/Fedora-KDE-Live-x86_64-39-1.5.iso",
        },
        {
          bytesCompleted: 2562,
          length: 2562,
          name: "Fedora-KDE-Live-x86_64-39/Fedora-Spins-39-1.5-x86_64-CHECKSUM",
        },
      ],
      hashString: "5d5649ea7d6eb21985a347495b66ecfb430b4cfe",
      haveUnchecked: 4669440,
      haveValid: 158200322,
      id: 7,
      isFinished: false,
      isPrivate: false,
      isStalled: false,
      leftUntilDone: 2318188544,
      magnetLink:
        "magnet:?xt=urn:btih:5d5649ea7d6eb21985a347495b66ecfb430b4cfe&dn=Fedora-KDE-Live-x86%5F64-39&tr=http%3A%2F%2Ftorrent.fedoraproject.org%3A6969%2Fannounce",
      metadataPercentComplete: 1,
      name: "Fedora-KDE-Live-x86_64-39",
      peers: [],
      peersConnected: 21,
      peersGettingFromUs: 0,
      peersSendingToUs: 21,
      percentDone: 0.0656,
      pieceCount: 9465,
      pieceSize: 262144,
      queuePosition: 1,
      rateDownload: 5124000,
      rateUpload: 0,
      recheckProgress: 0,
      seedRatioLimit: 2,
      seedRatioMode: 0,
      sizeWhenDone: 2481058306,
      startDate: 1728666778,
      status: 4,
      totalSize: 2481058306,
      trackerStats: [
        {
          announce: "http://torrent.fedoraproject.org:6969/announce",
          announceState: 1,
          downloadCount: 55,
          hasAnnounced: true,
          hasScraped: true,
          host: "http://torrent.fedoraproject.org:6969",
          id: 0,
          isBackup: false,
          lastAnnouncePeerCount: 39,
          lastAnnounceResult: "Success",
          lastAnnounceStartTime: 1728666779,
          lastAnnounceSucceeded: true,
          lastAnnounceTime: 1728666779,
          lastAnnounceTimedOut: false,
          lastScrapeResult: "",
          lastScrapeStartTime: 0,
          lastScrapeSucceeded: true,
          lastScrapeTime: 1728666779,
          lastScrapeTimedOut: false,
          leecherCount: 2,
          nextAnnounceTime: 1728668646,
          nextScrapeTime: 1728668580,
          scrape: "http://torrent.fedoraproject.org:6969/scrape",
          scrapeState: 1,
          seederCount: 37,
          tier: 0,
        },
      ],
      trackers: [
        {
          announce: "http://torrent.fedoraproject.org:6969/announce",
          id: 0,
          scrape: "http://torrent.fedoraproject.org:6969/scrape",
          tier: 0,
        },
      ],
      uploadRatio: 0,
      uploadedEver: 0,
      webseedsSendingToUs: 0,
    },
  ],
  session: {
    "alt-speed-down": 50,
    "alt-speed-enabled": false,
    "alt-speed-time-begin": 540,
    "alt-speed-time-day": 127,
    "alt-speed-time-enabled": false,
    "alt-speed-time-end": 1020,
    "alt-speed-up": 50,
    "blocklist-enabled": false,
    "blocklist-size": 0,
    "blocklist-url": "http://www.example.com/blocklist",
    "cache-size-mb": 4,
    "config-dir": "/config",
    "dht-enabled": true,
    "download-dir": "/downloads/complete",
    "download-dir-free-space": 488690164736,
    "download-queue-enabled": true,
    "download-queue-size": 5,
    encryption: "preferred",
    "idle-seeding-limit": 30,
    "idle-seeding-limit-enabled": false,
    "incomplete-dir": "/downloads/incomplete",
    "incomplete-dir-enabled": true,
    "lpd-enabled": false,
    "peer-limit-global": 200,
    "peer-limit-per-torrent": 50,
    "peer-port": 51413,
    "peer-port-random-on-start": false,
    "pex-enabled": true,
    "port-forwarding-enabled": true,
    "queue-stalled-enabled": true,
    "queue-stalled-minutes": 30,
    "rename-partial-files": true,
    "rpc-version": 16,
    "rpc-version-minimum": 1,
    "script-torrent-done-enabled": false,
    "script-torrent-done-filename": "",
    "seed-queue-enabled": true,
    "seed-queue-size": 10,
    seedRatioLimit: 2,
    seedRatioLimited: false,
    "session-id": "vgxaLats11QjjKIa7fTYPtESEVDMto44NBDTZvrff7PRRLOB",
    "speed-limit-down": 100,
    "speed-limit-down-enabled": false,
    "speed-limit-up": 100,
    "speed-limit-up-enabled": false,
    "start-added-torrents": true,
    "trash-original-torrent-files": false,
    units: {
      "memory-bytes": 1024,
      "memory-units": ["KiB", "MiB", "GiB", "TiB"],
      "size-bytes": 1000,
      "size-units": ["kB", "MB", "GB", "TB"],
      "speed-bytes": 1000,
      "speed-units": ["kB/s", "MB/s", "GB/s", "TB/s"],
    },
    "utp-enabled": false,
    version: "3.00 (bb6b5a062e)",
  },
  sessionStats: {
    activeTorrentCount: 0,
    "cumulative-stats": {
      downloadedBytes: 1358635081,
      filesAdded: 7,
      secondsActive: 10867,
      sessionCount: 2,
      uploadedBytes: 65588,
    },
    "current-stats": {
      downloadedBytes: 1293148863,
      filesAdded: 6,
      secondsActive: 5827,
      sessionCount: 1,
      uploadedBytes: 65588,
    },
    downloadSpeed: 0,
    pausedTorrentCount: 2,
    torrentCount: 2,
    uploadSpeed: 0,
  },
  freeSpace: {
    path: "/downloads/complete",
    "size-bytes": 64 * 1024 * 1024 * 1024,
  },
};

export function isTestingServer(server: Server): boolean {
  return server.name === "app" && server.url === "app-testing-url";
}

export default class MockTransmissionClient {
  async request({
    method,
    arguments: args,
  }: {
    method: string;
    arguments: object;
  }): Promise<object> {
    switch (method) {
      case "torrent-get": {
        return { result: "success", arguments: torrentGet() };
      }
      case "torrent-start": {
        torrentStatus(TorrentStatus.DOWNLOADING, args);
        break;
      }
      case "torrent-start-now": {
        torrentStatus(TorrentStatus.DOWNLOADING, args);
        break;
      }
      case "torrent-stop": {
        torrentStatus(TorrentStatus.STOPPED, args);
        break;
      }
      case "torrent-verify": {
        torrentStatus(TorrentStatus.VERIFYING_LOCAL_DATA, args);
        break;
      }
      case "torrent-remove": {
        torrentRemove(args);
        break;
      }
      case "session-get": {
        return { result: "success", arguments: sessionGet() };
      }
      case "session-set": {
        sessionSet(args);
        break;
      }
      case "session-stats": {
        return { result: "sucess", arguments: sessionStats() };
      }
      case "free-space": {
        return { result: "success", arguments: freeSpace() };
      }
    }

    return { result: "success", arguments: {} };
  }
}

function torrentGet() {
  return { torrents: storage.torrents };
}

function torrentStatus(
  status: TorrentStatus,
  args: Pick<TorrentRemoveRequest, "ids">
) {
  if (args.ids === undefined || args.ids == "recently-active") {
    return;
  }

  if (typeof args.ids === "number") {
    storage.torrents = storage.torrents.map((torrent) => {
      if (torrent.id === args.ids) {
        torrent.status = status;
      }
      return torrent;
    });
    return;
  }

  for (const id of args.ids) {
    storage.torrents = storage.torrents.map((torrent) => {
      if (torrent.id === Number(id)) {
        torrent.status = status;
      }
      return torrent;
    });
  }
}

function torrentRemove(args: Pick<TorrentRemoveRequest, "ids">) {
  if (args.ids === undefined || args.ids == "recently-active") {
    return;
  }

  if (typeof args.ids === "number") {
    storage.torrents = storage.torrents.filter((torrent) => {
      return torrent.id !== args.ids;
    });
    return;
  }

  for (const id of args.ids) {
    storage.torrents = storage.torrents.filter((torrent) => {
      return torrent.id !== id;
    });
  }
}

function sessionGet(): SessionGetResponse {
  return storage.session;
}

function sessionSet(args: SessionGetRequest) {
  for (const [key, value] of Object.entries(args)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    storage.session[key] = value;
  }
}

function sessionStats(): SessionStatsResponse {
  return storage.sessionStats;
}

function freeSpace(): FreeSpaceResponse {
  return storage.freeSpace;
}
