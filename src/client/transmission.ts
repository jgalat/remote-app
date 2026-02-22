import TransmissionClient, {
  type Torrent as TransmissionTorrent,
  type SessionGetResponse,
  type SessionStatsResponse,
} from "@remote-app/transmission-client";

import type { TorrentClient } from "./interface";
import type {
  TorrentId,
  TorrentListItem,
  TorrentInfoDetail,
  TorrentSettingsDetail,
  TorrentFilesDetail,
  TorrentPeersDetail,
  TorrentTrackersDetail,
  TorrentPiecesDetail,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
  Session,
  SessionStats,
} from "./types";

const listFields = [
  "id",
  "addedDate",
  "doneDate",
  "name",
  "totalSize",
  "error",
  "errorString",
  "eta",
  "isFinished",
  "leftUntilDone",
  "peersConnected",
  "peersGettingFromUs",
  "peersSendingToUs",
  "percentDone",
  "queuePosition",
  "rateDownload",
  "rateUpload",
  "recheckProgress",
  "sizeWhenDone",
  "status",
  "uploadedEver",
  "uploadRatio",
  "webseedsSendingToUs",
  "activityDate",
  "magnetLink",
  "downloadDir",
] as const;

const infoFields = [
  ...listFields,
  "downloadedEver",
  "file-count",
  "pieceCount",
  "pieceSize",
  "pieces",
] as const;

const settingsFields = [
  "bandwidthPriority",
  "honorsSessionLimits",
  "downloadLimited",
  "downloadLimit",
  "uploadLimited",
  "uploadLimit",
  "seedRatioMode",
  "seedRatioLimit",
  "seedIdleMode",
  "seedIdleLimit",
] as const;

const filesFields = ["files", "fileStats"] as const;
const peersFields = ["peers"] as const;
const trackersFields = ["trackerStats"] as const;
const piecesFields = ["pieceCount", "pieceSize", "pieces"] as const;

type TorrentField =
  | (typeof listFields)[number]
  | (typeof infoFields)[number]
  | (typeof settingsFields)[number]
  | (typeof filesFields)[number]
  | (typeof peersFields)[number]
  | (typeof trackersFields)[number]
  | (typeof piecesFields)[number];

function requiredNumber(value: number | undefined, field: string): number {
  if (typeof value !== "number") {
    throw new Error(`Transmission missing numeric field: ${field}`);
  }
  return value;
}

function requiredString(value: string | undefined, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`Transmission missing string field: ${field}`);
  }
  return value;
}

function requiredBoolean(value: boolean | undefined, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Transmission missing boolean field: ${field}`);
  }
  return value;
}

function requiredArray<T>(value: T[] | undefined, field: string): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Transmission missing array field: ${field}`);
  }
  return value;
}

function toTorrentListItem(t: TransmissionTorrent): TorrentListItem {
  return {
    id: requiredNumber(t.id, "id"),
    name: requiredString(t.name, "name"),
    status: requiredNumber(t.status, "status"),
    percentDone: requiredNumber(t.percentDone, "percentDone"),
    rateDownload: requiredNumber(t.rateDownload, "rateDownload"),
    rateUpload: requiredNumber(t.rateUpload, "rateUpload"),
    totalSize: requiredNumber(t.totalSize, "totalSize"),
    sizeWhenDone: requiredNumber(t.sizeWhenDone, "sizeWhenDone"),
    leftUntilDone: requiredNumber(t.leftUntilDone, "leftUntilDone"),
    eta: requiredNumber(t.eta, "eta"),
    error: requiredNumber(t.error, "error"),
    errorString: requiredString(t.errorString, "errorString"),
    isFinished: requiredBoolean(t.isFinished, "isFinished"),
    peersConnected: requiredNumber(t.peersConnected, "peersConnected"),
    peersGettingFromUs: requiredNumber(t.peersGettingFromUs, "peersGettingFromUs"),
    peersSendingToUs: requiredNumber(t.peersSendingToUs, "peersSendingToUs"),
    webseedsSendingToUs: t.webseedsSendingToUs,
    uploadedEver: requiredNumber(t.uploadedEver, "uploadedEver"),
    uploadRatio: requiredNumber(t.uploadRatio, "uploadRatio"),
    recheckProgress: t.recheckProgress,
    queuePosition: requiredNumber(t.queuePosition, "queuePosition"),
    addedDate: requiredNumber(t.addedDate, "addedDate"),
    doneDate: requiredNumber(t.doneDate, "doneDate"),
    activityDate: requiredNumber(t.activityDate, "activityDate"),
    magnetLink: requiredString(t.magnetLink, "magnetLink"),
    downloadDir: requiredString(t.downloadDir, "downloadDir"),
  };
}

function toTorrentInfoDetail(t: TransmissionTorrent): TorrentInfoDetail {
  return {
    ...toTorrentListItem(t),
    downloadedEver: requiredNumber(t.downloadedEver, "downloadedEver"),
    pieceCount: requiredNumber(t.pieceCount, "pieceCount"),
    pieceSize: requiredNumber(t.pieceSize, "pieceSize"),
    pieces: requiredString(t.pieces, "pieces"),
    filesCount: requiredNumber(t["file-count"], "file-count"),
  };
}

function toTorrentSettingsDetail(t: TransmissionTorrent): TorrentSettingsDetail {
  return {
    bandwidthPriority: t.bandwidthPriority,
    honorsSessionLimits: t.honorsSessionLimits,
    downloadLimited: requiredBoolean(t.downloadLimited, "downloadLimited"),
    downloadLimit: requiredNumber(t.downloadLimit, "downloadLimit"),
    uploadLimited: requiredBoolean(t.uploadLimited, "uploadLimited"),
    uploadLimit: requiredNumber(t.uploadLimit, "uploadLimit"),
    seedRatioMode: requiredNumber(t.seedRatioMode, "seedRatioMode"),
    seedRatioLimit: requiredNumber(t.seedRatioLimit, "seedRatioLimit"),
    seedIdleMode: requiredNumber(t.seedIdleMode, "seedIdleMode"),
    seedIdleLimit: requiredNumber(t.seedIdleLimit, "seedIdleLimit"),
  };
}

function toTorrentFilesDetail(t: TransmissionTorrent): TorrentFilesDetail {
  const files = requiredArray(t.files, "files").map((file, i) => ({
    bytesCompleted: requiredNumber(file.bytesCompleted, `files[${i}].bytesCompleted`),
    length: requiredNumber(file.length, `files[${i}].length`),
    name: requiredString(file.name, `files[${i}].name`),
  }));
  const fileStats = requiredArray(t.fileStats, "fileStats").map((stats, i) => ({
    bytesCompleted: requiredNumber(
      stats.bytesCompleted,
      `fileStats[${i}].bytesCompleted`,
    ),
    wanted: requiredBoolean(stats.wanted, `fileStats[${i}].wanted`),
    priority: requiredNumber(stats.priority, `fileStats[${i}].priority`),
  }));
  return { files, fileStats };
}

function toTorrentPeersDetail(t: TransmissionTorrent): TorrentPeersDetail {
  const peers = (t.peers ?? []).map((peer, i) => ({
    address: requiredString(peer.address, `peers[${i}].address`),
    port: requiredNumber(peer.port, `peers[${i}].port`),
    clientName: requiredString(peer.clientName, `peers[${i}].clientName`),
    isUTP: requiredBoolean(peer.isUTP, `peers[${i}].isUTP`),
    isEncrypted: requiredBoolean(peer.isEncrypted, `peers[${i}].isEncrypted`),
    rateToClient: requiredNumber(peer.rateToClient, `peers[${i}].rateToClient`),
    rateToPeer: requiredNumber(peer.rateToPeer, `peers[${i}].rateToPeer`),
    progress: requiredNumber(peer.progress, `peers[${i}].progress`),
  }));
  return { peers };
}

function toTorrentTrackersDetail(t: TransmissionTorrent): TorrentTrackersDetail {
  const trackerStats = (t.trackerStats ?? []).map((tracker, i) => ({
    announce: requiredString(tracker.announce, `trackerStats[${i}].announce`),
    tier: requiredNumber(tracker.tier, `trackerStats[${i}].tier`),
    seederCount: requiredNumber(tracker.seederCount, `trackerStats[${i}].seederCount`),
    leecherCount: requiredNumber(tracker.leecherCount, `trackerStats[${i}].leecherCount`),
    downloadCount: requiredNumber(
      tracker.downloadCount,
      `trackerStats[${i}].downloadCount`,
    ),
    lastAnnounceTime: requiredNumber(
      tracker.lastAnnounceTime,
      `trackerStats[${i}].lastAnnounceTime`,
    ),
    lastAnnounceSucceeded: requiredBoolean(
      tracker.lastAnnounceSucceeded,
      `trackerStats[${i}].lastAnnounceSucceeded`,
    ),
    lastAnnouncePeerCount: requiredNumber(
      tracker.lastAnnouncePeerCount,
      `trackerStats[${i}].lastAnnouncePeerCount`,
    ),
    lastAnnounceResult: requiredString(
      tracker.lastAnnounceResult,
      `trackerStats[${i}].lastAnnounceResult`,
    ),
    nextAnnounceTime: requiredNumber(
      tracker.nextAnnounceTime,
      `trackerStats[${i}].nextAnnounceTime`,
    ),
    lastScrapeTime: requiredNumber(
      tracker.lastScrapeTime,
      `trackerStats[${i}].lastScrapeTime`,
    ),
    lastScrapeSucceeded: requiredBoolean(
      tracker.lastScrapeSucceeded,
      `trackerStats[${i}].lastScrapeSucceeded`,
    ),
    lastScrapeResult: requiredString(
      tracker.lastScrapeResult,
      `trackerStats[${i}].lastScrapeResult`,
    ),
    nextScrapeTime: requiredNumber(
      tracker.nextScrapeTime,
      `trackerStats[${i}].nextScrapeTime`,
    ),
    scrape: requiredString(tracker.scrape, `trackerStats[${i}].scrape`),
  }));
  return { trackerStats };
}

function toTorrentPiecesDetail(t: TransmissionTorrent): TorrentPiecesDetail {
  return {
    pieceCount: requiredNumber(t.pieceCount, "pieceCount"),
    pieceSize: requiredNumber(t.pieceSize, "pieceSize"),
    pieces: requiredString(t.pieces, "pieces"),
  };
}

function toSession(s: SessionGetResponse): Session {
  return {
    "speed-limit-down-enabled": requiredBoolean(s["speed-limit-down-enabled"], "speed-limit-down-enabled"),
    "speed-limit-down": requiredNumber(s["speed-limit-down"], "speed-limit-down"),
    "speed-limit-up-enabled": requiredBoolean(s["speed-limit-up-enabled"], "speed-limit-up-enabled"),
    "speed-limit-up": requiredNumber(s["speed-limit-up"], "speed-limit-up"),
    "alt-speed-enabled": requiredBoolean(s["alt-speed-enabled"], "alt-speed-enabled"),
    "alt-speed-down": requiredNumber(s["alt-speed-down"], "alt-speed-down"),
    "alt-speed-up": requiredNumber(s["alt-speed-up"], "alt-speed-up"),
    "alt-speed-time-enabled": requiredBoolean(s["alt-speed-time-enabled"], "alt-speed-time-enabled"),
    "alt-speed-time-begin": requiredNumber(s["alt-speed-time-begin"], "alt-speed-time-begin"),
    "alt-speed-time-end": requiredNumber(s["alt-speed-time-end"], "alt-speed-time-end"),
    "alt-speed-time-day": requiredNumber(s["alt-speed-time-day"], "alt-speed-time-day"),
    seedRatioLimited: requiredBoolean(s.seedRatioLimited, "seedRatioLimited"),
    seedRatioLimit: requiredNumber(s.seedRatioLimit, "seedRatioLimit"),
    "idle-seeding-limit-enabled": requiredBoolean(s["idle-seeding-limit-enabled"], "idle-seeding-limit-enabled"),
    "idle-seeding-limit": requiredNumber(s["idle-seeding-limit"], "idle-seeding-limit"),
    "download-queue-enabled": requiredBoolean(s["download-queue-enabled"], "download-queue-enabled"),
    "download-queue-size": requiredNumber(s["download-queue-size"], "download-queue-size"),
    "seed-queue-enabled": requiredBoolean(s["seed-queue-enabled"], "seed-queue-enabled"),
    "seed-queue-size": requiredNumber(s["seed-queue-size"], "seed-queue-size"),
    "dht-enabled": requiredBoolean(s["dht-enabled"], "dht-enabled"),
    "lpd-enabled": requiredBoolean(s["lpd-enabled"], "lpd-enabled"),
    "pex-enabled": requiredBoolean(s["pex-enabled"], "pex-enabled"),
    "download-dir": requiredString(s["download-dir"], "download-dir"),
  };
}

function toSessionStats(s: SessionStatsResponse): SessionStats {
  return {
    activeTorrentCount: requiredNumber(s.activeTorrentCount, "activeTorrentCount"),
    pausedTorrentCount: requiredNumber(s.pausedTorrentCount, "pausedTorrentCount"),
    torrentCount: requiredNumber(s.torrentCount, "torrentCount"),
    downloadSpeed: requiredNumber(s.downloadSpeed, "downloadSpeed"),
    uploadSpeed: requiredNumber(s.uploadSpeed, "uploadSpeed"),
  };
}

function toNumericIds(ids: TorrentId[]): number[] {
  return ids.map((id) => Number(id));
}

export class TransmissionAdapter implements TorrentClient {
  private client: TransmissionClient;

  constructor(config: { url: string; username?: string; password?: string }) {
    this.client = new TransmissionClient(config);
  }

  private async getSingleTorrent(
    id: TorrentId,
    fields: readonly TorrentField[],
  ): Promise<TransmissionTorrent | undefined> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields: [...fields], ids: [Number(id)] },
    });
    return response.arguments.torrents[0];
  }

  async getTorrents(): Promise<TorrentListItem[]> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields: [...listFields] },
    });
    return response.arguments.torrents.map(toTorrentListItem);
  }

  async getTorrentInfo(id: TorrentId): Promise<TorrentInfoDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, infoFields);
    if (!torrent) return undefined;
    return toTorrentInfoDetail(torrent);
  }

  async getTorrentSettings(id: TorrentId): Promise<TorrentSettingsDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, settingsFields);
    if (!torrent) return undefined;
    return toTorrentSettingsDetail(torrent);
  }

  async getTorrentFiles(id: TorrentId): Promise<TorrentFilesDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, filesFields);
    if (!torrent) return undefined;
    return toTorrentFilesDetail(torrent);
  }

  async getTorrentPeers(id: TorrentId): Promise<TorrentPeersDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, peersFields);
    if (!torrent) return undefined;
    return toTorrentPeersDetail(torrent);
  }

  async getTorrentTrackers(id: TorrentId): Promise<TorrentTrackersDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, trackersFields);
    if (!torrent) return undefined;
    return toTorrentTrackersDetail(torrent);
  }

  async getTorrentPieces(id: TorrentId): Promise<TorrentPiecesDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, piecesFields);
    if (!torrent) return undefined;
    return toTorrentPiecesDetail(torrent);
  }

  async addTorrent(params: AddTorrentParams): Promise<AddTorrentResult | null> {
    const reqArgs = params.filename
      ? {
          filename: params.filename,
          "download-dir": params["download-dir"],
          paused: params.paused,
        }
      : {
          metainfo: params.metainfo ?? "",
          "download-dir": params["download-dir"],
          paused: params.paused,
        };
    const response = await this.client.request({
      method: "torrent-add",
      arguments: reqArgs,
    });
    const result = response.arguments;
    const addedList =
      "torrent-added" in result
        ? result["torrent-added"]
        : "torrent-duplicate" in result
          ? result["torrent-duplicate"]
          : [];

    const first = addedList[0];
    if (!first || typeof first.id !== "number" || typeof first.name !== "string") {
      return null;
    }

    return { id: first.id, name: first.name };
  }

  async removeTorrents(ids: TorrentId[], deleteData = false): Promise<void> {
    await this.client.request({
      method: "torrent-remove",
      arguments: { ids: toNumericIds(ids), "delete-local-data": deleteData },
    });
  }

  async startTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "torrent-start",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async startTorrentsNow(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "torrent-start-now",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async stopTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "torrent-stop",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async verifyTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "torrent-verify",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async reannounceTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "torrent-reannounce",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async setTorrent(ids: TorrentId[], params: SetTorrentParams): Promise<void> {
    await this.client.request({
      method: "torrent-set",
      arguments: { ids: toNumericIds(ids), ...params },
    });
  }

  async setLocation(params: SetLocationParams): Promise<void> {
    await this.client.request({
      method: "torrent-set-location",
      arguments: {
        ids: toNumericIds(params.ids),
        location: params.location,
        move: params.move,
      },
    });
  }

  async queueMoveTop(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "queue-move-top",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async queueMoveUp(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "queue-move-up",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async queueMoveDown(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "queue-move-down",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async queueMoveBottom(ids: TorrentId[]): Promise<void> {
    await this.client.request({
      method: "queue-move-bottom",
      arguments: { ids: toNumericIds(ids) },
    });
  }

  async getSession(): Promise<Session> {
    const response = await this.client.request({ method: "session-get" });
    return toSession(response.arguments);
  }

  async setSession(params: Partial<Session>): Promise<void> {
    await this.client.request({
      method: "session-set",
      arguments: params,
    });
  }

  async getPreferences(): Promise<Record<string, unknown>> {
    const session = await this.getSession();
    return { ...session };
  }

  async setPreferences(prefs: Record<string, unknown>): Promise<void> {
    const next: Partial<Session> = {};

    if (typeof prefs["speed-limit-down-enabled"] === "boolean") next["speed-limit-down-enabled"] = prefs["speed-limit-down-enabled"];
    if (typeof prefs["speed-limit-down"] === "number") next["speed-limit-down"] = prefs["speed-limit-down"];
    if (typeof prefs["speed-limit-up-enabled"] === "boolean") next["speed-limit-up-enabled"] = prefs["speed-limit-up-enabled"];
    if (typeof prefs["speed-limit-up"] === "number") next["speed-limit-up"] = prefs["speed-limit-up"];
    if (typeof prefs["alt-speed-enabled"] === "boolean") next["alt-speed-enabled"] = prefs["alt-speed-enabled"];
    if (typeof prefs["alt-speed-down"] === "number") next["alt-speed-down"] = prefs["alt-speed-down"];
    if (typeof prefs["alt-speed-up"] === "number") next["alt-speed-up"] = prefs["alt-speed-up"];
    if (typeof prefs["alt-speed-time-enabled"] === "boolean") next["alt-speed-time-enabled"] = prefs["alt-speed-time-enabled"];
    if (typeof prefs["alt-speed-time-begin"] === "number") next["alt-speed-time-begin"] = prefs["alt-speed-time-begin"];
    if (typeof prefs["alt-speed-time-end"] === "number") next["alt-speed-time-end"] = prefs["alt-speed-time-end"];
    if (typeof prefs["alt-speed-time-day"] === "number") next["alt-speed-time-day"] = prefs["alt-speed-time-day"];
    if (typeof prefs.seedRatioLimited === "boolean") next.seedRatioLimited = prefs.seedRatioLimited;
    if (typeof prefs.seedRatioLimit === "number") next.seedRatioLimit = prefs.seedRatioLimit;
    if (typeof prefs["idle-seeding-limit-enabled"] === "boolean") next["idle-seeding-limit-enabled"] = prefs["idle-seeding-limit-enabled"];
    if (typeof prefs["idle-seeding-limit"] === "number") next["idle-seeding-limit"] = prefs["idle-seeding-limit"];
    if (typeof prefs["download-queue-enabled"] === "boolean") next["download-queue-enabled"] = prefs["download-queue-enabled"];
    if (typeof prefs["download-queue-size"] === "number") next["download-queue-size"] = prefs["download-queue-size"];
    if (typeof prefs["seed-queue-enabled"] === "boolean") next["seed-queue-enabled"] = prefs["seed-queue-enabled"];
    if (typeof prefs["seed-queue-size"] === "number") next["seed-queue-size"] = prefs["seed-queue-size"];
    if (typeof prefs["dht-enabled"] === "boolean") next["dht-enabled"] = prefs["dht-enabled"];
    if (typeof prefs["lpd-enabled"] === "boolean") next["lpd-enabled"] = prefs["lpd-enabled"];
    if (typeof prefs["pex-enabled"] === "boolean") next["pex-enabled"] = prefs["pex-enabled"];
    if (typeof prefs["download-dir"] === "string") next["download-dir"] = prefs["download-dir"];

    await this.setSession(next);
  }

  async getSessionStats(): Promise<SessionStats> {
    const response = await this.client.request({ method: "session-stats" });
    return toSessionStats(response.arguments);
  }

  async ping(): Promise<void> {
    await this.client.request({ method: "session-get" });
  }
}
