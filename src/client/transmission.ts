import TransmissionClient, {
  type TorrentField as TransmissionTorrentField,
  type TorrentForFields,
  type SessionGetField,
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
] as const satisfies readonly TransmissionTorrentField[];

const infoFields = [
  ...listFields,
  "downloadedEver",
  "file-count",
  "pieceCount",
  "pieceSize",
  "pieces",
] as const satisfies readonly TransmissionTorrentField[];

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
] as const satisfies readonly TransmissionTorrentField[];

const filesFields = ["files", "fileStats"] as const satisfies readonly TransmissionTorrentField[];
const peersFields = ["peers"] as const satisfies readonly TransmissionTorrentField[];
const trackersFields = ["trackerStats"] as const satisfies readonly TransmissionTorrentField[];
const piecesFields = ["pieceCount", "pieceSize", "pieces"] as const satisfies readonly TransmissionTorrentField[];

const sessionFields = [
  "speed-limit-down-enabled",
  "speed-limit-down",
  "speed-limit-up-enabled",
  "speed-limit-up",
  "alt-speed-enabled",
  "alt-speed-down",
  "alt-speed-up",
  "alt-speed-time-enabled",
  "alt-speed-time-begin",
  "alt-speed-time-end",
  "alt-speed-time-day",
  "seedRatioLimited",
  "seedRatioLimit",
  "idle-seeding-limit-enabled",
  "idle-seeding-limit",
  "download-queue-enabled",
  "download-queue-size",
  "seed-queue-enabled",
  "seed-queue-size",
  "dht-enabled",
  "lpd-enabled",
  "pex-enabled",
  "download-dir",
] as const satisfies readonly SessionGetField[];

type TorrentField = TransmissionTorrentField;
type InfoTorrent = TorrentForFields<typeof infoFields>;
type FilesTorrent = TorrentForFields<typeof filesFields>;
type PeersTorrent = TorrentForFields<typeof peersFields>;
type TrackersTorrent = TorrentForFields<typeof trackersFields>;

function toTorrentInfoDetail(t: InfoTorrent): TorrentInfoDetail {
  const { ["file-count"]: filesCount, ...rest } = t;
  return {
    ...rest,
    filesCount,
  };
}

function toTorrentFilesDetail(t: FilesTorrent): TorrentFilesDetail {
  const files = t.files.map((file) => ({
    bytesCompleted: file.bytesCompleted,
    length: file.length,
    name: file.name,
  }));
  const fileStats = t.fileStats.map((stats) => ({
    bytesCompleted: stats.bytesCompleted,
    wanted: stats.wanted,
    priority: stats.priority,
  }));
  return { files, fileStats };
}

function toTorrentPeersDetail(t: PeersTorrent): TorrentPeersDetail {
  const peers = t.peers.map((peer) => ({
    address: peer.address,
    port: peer.port,
    clientName: peer.clientName,
    isUTP: peer.isUTP,
    isEncrypted: peer.isEncrypted,
    rateToClient: peer.rateToClient,
    rateToPeer: peer.rateToPeer,
    progress: peer.progress,
  }));
  return { peers };
}

function toTorrentTrackersDetail(t: TrackersTorrent): TorrentTrackersDetail {
  const trackerStats = t.trackerStats.map((tracker) => ({
    announce: tracker.announce,
    tier: tracker.tier,
    seederCount: tracker.seederCount,
    leecherCount: tracker.leecherCount,
    downloadCount: tracker.downloadCount,
    lastAnnounceTime: tracker.lastAnnounceTime,
    lastAnnounceSucceeded: tracker.lastAnnounceSucceeded,
    lastAnnouncePeerCount: tracker.lastAnnouncePeerCount,
    lastAnnounceResult: tracker.lastAnnounceResult,
    nextAnnounceTime: tracker.nextAnnounceTime,
    lastScrapeTime: tracker.lastScrapeTime,
    lastScrapeSucceeded: tracker.lastScrapeSucceeded,
    lastScrapeResult: tracker.lastScrapeResult,
    nextScrapeTime: tracker.nextScrapeTime,
    scrape: tracker.scrape,
  }));
  return { trackerStats };
}


function toSessionStats(s: SessionStatsResponse): SessionStats {
  return {
    activeTorrentCount: s.activeTorrentCount,
    pausedTorrentCount: s.pausedTorrentCount,
    torrentCount: s.torrentCount,
    downloadSpeed: s.downloadSpeed,
    uploadSpeed: s.uploadSpeed,
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

  private async getSingleTorrent<const F extends readonly TorrentField[]>(
    id: TorrentId,
    fields: F,
  ): Promise<TorrentForFields<F> | undefined> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields, ids: [Number(id)] },
    });
    return response.arguments.torrents[0];
  }

  async getTorrents(): Promise<TorrentListItem[]> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields: listFields },
    });
    return response.arguments.torrents;
  }

  async getTorrentInfo(id: TorrentId): Promise<TorrentInfoDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, infoFields);
    if (!torrent) return undefined;
    return toTorrentInfoDetail(torrent);
  }

  async getTorrentSettings(id: TorrentId): Promise<TorrentSettingsDetail | undefined> {
    const torrent = await this.getSingleTorrent(id, settingsFields);
    if (!torrent) return undefined;
    return torrent;
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
    return torrent;
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
    const response = await this.client.request({
      method: "session-get",
      arguments: { fields: sessionFields },
    });
    return response.arguments;
  }

  async setSession(params: Partial<Session>): Promise<void> {
    await this.client.request({
      method: "session-set",
      arguments: params,
    });
  }

  async getPreferences(): Promise<Record<string, unknown>> {
    return await this.getSession();
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
