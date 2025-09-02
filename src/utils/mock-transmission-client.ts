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
      activityDate: 1756588440,
      addedDate: 1756588407,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadedEver: 618541930,
      error: 0,
      errorString: "",
      eta: -1,
      fileStats: [
        { bytesCompleted: 2922, priority: 1, wanted: true },
        { bytesCompleted: 618539008, priority: -1, wanted: true },
      ],
      files: [
        {
          bytesCompleted: 2922,
          length: 2922,
          name: "Fedora-i3-Live-x86_64-42/Fedora-Spins-42-1.1-x86_64-CHECKSUM",
        },
        {
          bytesCompleted: 618539008,
          length: 1676683264,
          name: "Fedora-i3-Live-x86_64-42/Fedora-i3-Live-x86_64-42-1.1.iso",
        },
      ],
      id: 2,
      isFinished: false,
      leftUntilDone: 1058144256,
      magnetLink:
        "magnet:?xt=urn:btih:b6ef4bde6b9e05ac2d6d226fbfc891772f3835bf&dn=Fedora-i3-Live-x86_64-42&tr=http%3A%2F%2Ftorrent.fedoraproject.org%3A6969%2Fannounce",
      name: "Fedora-i3-Live-x86_64-42",
      peers: [],
      peersConnected: 0,
      peersGettingFromUs: 0,
      peersSendingToUs: 0,
      percentDone: 0.3689,
      pieceCount: 6397,
      pieceSize: 262144,
      pieces:
        "//91+v///////////////4f////////////7f//8MAAf//////////////f//////////98/////+oAP/////////////////gD//////9/+H//////////////////////+BAB///////////////////+/////////////////+h////x///////A/8AQCP////////////////////////8AQA///////4D////9/////3////////////+AAAQf////////AhAAwACACCB9/E///////f/////+AAEADAAAg///8IIAAB//L///7/wAAAAAQIAAAAD//+AQswAfv////4HQAAQAp//wT/gf/x/////+gH/sAAAAIIH/xD/8H/f///7/+EAP//wAAAP//wAP/+A///3////gAP/gAAAEH/8CfyP///8AgAAIA/wAAAAH//P/v////AEAAAAAAEAAX//j//QH/wf7ACAAAACB4AAAAf/44AMR8CAAAAEAAAwH/gAAEEAZAAAAAAAAAAABAAVwAB9UABAAAAAAAAAABAQAAAAAAAAAAAABACCAAAAAAAQAAAQAAAAgAAAUAAAEAAAAAAAAAAEAABAAAQAAAAAAAAQQCIAAAAAAAAAIAAABAEAABAAIAAACAAAAAgAAAABABAAACAAQAABAAAAIAAAIAAAAAAgAEAAAAAAAAQEAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAQAAAAQAQAAAAAAAAAEAAAwAAEAAAAAgAAEAAAAAQAAAAAAEAAAAABAAAARAAAAEAAgAAAAAAAAAAQAAAAAAAEAEIAAAAAAAgAAAAAAQAAAAAAAAAgAAAAAAAIBAAAAAAAAgAAAgAAAECAAAEAAAAACAAIAAAAAAAAAAAAAAACAAAAAAAQAAAAAAAAAAAACAAAAIAAAAAAAAAAAAEEAAAAAAAAAAAAABAAEAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAQAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAg=",
      queuePosition: 0,
      rateDownload: 0,
      rateUpload: 0,
      recheckProgress: 0,
      sizeWhenDone: 1676686186,
      status: 0,
      totalSize: 1676686186,
      trackers: [
        {
          announce: "http://torrent.fedoraproject.org:6969/announce",
          id: 0,
          scrape: "http://torrent.fedoraproject.org:6969/scrape",
          sitename: "fedoraproject",
          tier: 0,
        },
      ],
      uploadRatio: 0,
      uploadedEver: 0,
      webseedsSendingToUs: 0,
    },
    {
      activityDate: 1756848778,
      addedDate: 1756848746,
      doneDate: 0,
      downloadDir: "/downloads/complete",
      downloadedEver: 442695680,
      error: 0,
      errorString: "",
      eta: -1,
      fileStats: [{ bytesCompleted: 442695680, priority: 0, wanted: true }],
      files: [
        {
          bytesCompleted: 442695680,
          length: 1378795520,
          name: "archlinux-2025.08.01-x86_64.iso",
        },
      ],
      id: 5,
      isFinished: false,
      leftUntilDone: 936099840,
      magnetLink:
        "magnet:?xt=urn:btih:ffb48118162732c8f56ad3e5a5612f2dd1a2be72&dn=archlinux-2025.08.01-x86_64.iso",
      name: "archlinux-2025.08.01-x86_64.iso",
      peers: [],
      peersConnected: 0,
      peersGettingFromUs: 0,
      peersSendingToUs: 0,
      percentDone: 0.3211,
      pieceCount: 2630,
      pieceSize: 524288,
      pieces:
        "////////////3f//7///////b7/f+0Ff////////////v8v/oBA//////zn//h/j/8Pv/n/+D/g///D/5///4P/IAf5/Bf/gAEAfgwAz/5+AOAlAH/zgX+BAFv48AOMAAAP/5/Af///5/gAACfzgA//+/gAgAAH/AAA7nxgZ5fwAAQPgAAABAAAAAAAAAH4CE4AAAAAIAAA/BAAAACAAAAAAAAAAAEAAAAAAICAQQIABAASAAARABAAAEACQAIAAAAACAAAAAUBAAAAACQAQAAAAAAAAAAAAAIEAAAACAAAEQAIMiAAAgAMAAACAAAAYAAAAAAAQAAAAAACAAAAAACAAAZAAIAAAAACAARQAAgCEAABAQAAAAgAAAAAAQAAAAIAAAAAAAAAAAQABAAAgAWAAACAAAAAQAAAAAAAAAACABEAABAAAAAQ=",
      queuePosition: 1,
      rateDownload: 0,
      rateUpload: 0,
      recheckProgress: 0,
      sizeWhenDone: 1378795520,
      status: 0,
      totalSize: 1378795520,
      trackers: [],
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
