import {
  FreeSpaceResponse,
  SessionGetResponse,
  SessionStatsResponse,
  SessionGetRequest,
  TorrentStatus,
  TorrentRemoveRequest,
  TorrentSetRequest,
  Priority,
} from "@remote-app/transmission-client";
import { Server } from "~/store/settings";

const storage = {
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
      pieces:
        "/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+//////////////3//////////////fi///////////+k8P/////////+ABPg//////////////////7//f//x//////D4GD////+IP+B87////////hcP///////////h/wwf///68D/d///////kQOH///wH8B9//wf8AAbxf///AQAC98f//hgCf/P//4H+AAgA5gPD//Af//4AB//D///////+BH/B+D//////////QPAA+P4f/8P6AJEAAJP+/8AQ=",
      queuePosition: 0,
      rateDownload: 0,
      rateUpload: 0,
      recheckProgress: 0,
      seedIdleLimit: 30,
      seedIdleMode: 0,
      seedRatioLimit: 2,
      seedRatioMode: 0,
      sizeWhenDone: 1378795520,
      status: 0,
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
      pieces:
        "/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v//////////////////////////////////8D/////////////////////////////////x/////////////gH/////////////////4AP/5///x////////////+BgAH///////////wA/gAAA//wP///////8AB//AAH////A////8AD//AD//wAAf////4D//AAAAPH/+AAB/////AD/AQHgAD////8Af/4AAB/AAP///8A//AfwP////AH+AAAAH/4AAH//AB4f/4AAD//wB/AAAPAA//wAAD/+AAP8AAA/AP8AAAA/4AA/AAA4B//wCD//gD/AAADAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ==",
      queuePosition: 1,
      rateDownload: 245000,
      rateUpload: 0,
      recheckProgress: 0,
      seedIdleLimit: 30,
      seedIdleMode: 0,
      seedRatioLimit: 6.5,
      seedRatioMode: 0,
      sizeWhenDone: 5028888920,
      status: 0,
      totalSize: 5028888920,
      trackerStats: [
        {
          announce: "http://torrent.fedoraproject.org:6969/announce",
          announceState: 0,
          downloadCount: 114,
          hasAnnounced: true,
          hasScraped: true,
          host: "torrent.fedoraproject.org:6969",
          id: 0,
          isBackup: false,
          lastAnnouncePeerCount: 31,
          lastAnnounceResult: "Success",
          lastAnnounceStartTime: 1761505576,
          lastAnnounceSucceeded: true,
          lastAnnounceTime: 1761505577,
          lastAnnounceTimedOut: false,
          lastScrapeResult: "",
          lastScrapeStartTime: 0,
          lastScrapeSucceeded: true,
          lastScrapeTime: 1761505577,
          lastScrapeTimedOut: false,
          leecherCount: 2,
          nextAnnounceTime: 0,
          nextScrapeTime: 1761507380,
          scrape: "http://torrent.fedoraproject.org:6969/scrape",
          scrapeState: 1,
          seederCount: 29,
          sitename: "fedoraproject",
          tier: 0,
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
    "alt-speed-time-begin": 540,
    "alt-speed-time-day": 127,
    "alt-speed-time-enabled": false,
    "alt-speed-time-end": 1020,
    "alt-speed-up": 50,
    "anti-brute-force-enabled": false,
    "anti-brute-force-threshold": 100,
    "blocklist-enabled": false,
    "blocklist-size": 0,
    "blocklist-url": "http://www.example.com/blocklist",
    "cache-size-mb": 4,
    "config-dir": "/config",
    "default-trackers": "",
    "dht-enabled": true,
    "download-dir": "/downloads/complete",
    "download-dir-free-space": 594832261120,
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
    "rpc-version": 17,
    "rpc-version-minimum": 14,
    "rpc-version-semver": "5.3.0",
    "script-torrent-added-enabled": false,
    "script-torrent-added-filename": "",
    "script-torrent-done-enabled": false,
    "script-torrent-done-filename": "",
    "script-torrent-done-seeding-enabled": false,
    "script-torrent-done-seeding-filename": "",
    "seed-queue-enabled": false,
    "seed-queue-size": 10,
    seedRatioLimit: 2,
    seedRatioLimited: false,
    "session-id": "EPqkRxAh5bux3KO6Wp3QZ66lEdPyf5oTeSQwh6EuDF7FT0E6",
    "speed-limit-down": 100,
    "speed-limit-down-enabled": false,
    "speed-limit-up": 100,
    "speed-limit-up-enabled": false,
    "start-added-torrents": true,
    "tcp-enabled": true,
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
    version: "4.0.6 (38c164933e)",
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
        const data = torrentGet();
        if (
          "ids" in args &&
          Array.isArray(args.ids) &&
          typeof args.ids[0] === "number"
        ) {
          const id = args.ids[0];
          data.torrents = data.torrents.filter((t) => t.id == id);
        }

        return { result: "success", arguments: data };
      }
      case "torrent-set": {
        torrentSet(args);
        break;
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

function torrentSet(params: TorrentSetRequest) {
  const id = Array.isArray(params.ids) ? params.ids[0] : -1;
  if (typeof id !== "number") return;
  storage.torrents = storage.torrents.map((torrent) => {
    if (torrent.id !== id) {
      return torrent;
    }

    const fs = [...torrent.fileStats];

    for (const i of params["files-wanted"] ?? []) {
      fs[i] = { ...fs[i], wanted: true };
    }

    for (const i of params["files-unwanted"] ?? []) {
      fs[i] = { ...fs[i], wanted: false };
    }

    for (const i of params["priority-low"] ?? []) {
      fs[i] = { ...fs[i], priority: Priority.LOW };
    }

    for (const i of params["priority-normal"] ?? []) {
      fs[i] = { ...fs[i], priority: Priority.NORMAL };
    }

    for (const i of params["priority-high"] ?? []) {
      fs[i] = { ...fs[i], priority: Priority.HIGH };
    }

    return { ...torrent, fileStats: fs };
  });
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
