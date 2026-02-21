import TransmissionClient from "@remote-app/transmission-client";

import type { TorrentClient } from "./interface";
import type {
  TorrentId,
  Torrent,
  ExtTorrent,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
  Session,
  SessionStats,
} from "./types";

const fields = [
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

const detailFields = [
  ...fields,
  "files",
  "fileStats",
  "peers",
  "trackerStats",
  "downloadedEver",
  "pieceCount",
  "pieceSize",
  "pieces",
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

function toNumericIds(ids: TorrentId[]): number[] {
  return ids.map((id) => Number(id));
}

export class TransmissionAdapter implements TorrentClient {
  private client: TransmissionClient;

  constructor(config: { url: string; username?: string; password?: string }) {
    this.client = new TransmissionClient(config);
  }

  async getTorrents(): Promise<Torrent[]> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields: [...fields] },
    });
    return (response.arguments?.torrents ?? []) as unknown as Torrent[];
  }

  async getTorrent(id: TorrentId): Promise<ExtTorrent | undefined> {
    const response = await this.client.request({
      method: "torrent-get",
      arguments: { fields: [...detailFields], ids: [Number(id)] },
    });
    const torrents = response.arguments?.torrents;
    if (!torrents || torrents.length === 0) return undefined;
    return torrents[0] as unknown as ExtTorrent;
  }

  async addTorrent(params: AddTorrentParams): Promise<AddTorrentResult | null> {
    const reqArgs = params.filename
      ? { filename: params.filename, "download-dir": params["download-dir"], paused: params.paused }
      : { metainfo: params.metainfo!, "download-dir": params["download-dir"], paused: params.paused };
    const response = await this.client.request({
      method: "torrent-add",
      arguments: reqArgs,
    });
    const result = response.arguments;
    if (!result) return null;
    const added =
      "torrent-added" in result
        ? result["torrent-added"]
        : "torrent-duplicate" in result
          ? result["torrent-duplicate"]
          : null;
    if (!added) return null;
    const t = Array.isArray(added) ? added[0] : added;
    if (!t) return null;
    return { id: t.id!, name: t.name! };
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
      arguments: { ids: toNumericIds(params.ids), location: params.location, move: params.move },
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
    return response.arguments as unknown as Session;
  }

  async setSession(params: Partial<Session>): Promise<void> {
    await this.client.request({
      method: "session-set",
      arguments: params,
    });
  }

  async getPreferences(): Promise<Record<string, unknown>> {
    const response = await this.client.request({ method: "session-get" });
    return response.arguments as unknown as Record<string, unknown>;
  }

  async setPreferences(prefs: Record<string, unknown>): Promise<void> {
    await this.client.request({
      method: "session-set",
      arguments: prefs,
    });
  }

  async getSessionStats(): Promise<SessionStats> {
    const response = await this.client.request({ method: "session-stats" });
    return response.arguments as unknown as SessionStats;
  }

  async getFreeSpace(path: string): Promise<number> {
    const response = await this.client.request({
      method: "free-space",
      arguments: { path },
    });
    return response.arguments?.["size-bytes"] ?? 0;
  }

  async ping(): Promise<void> {
    await this.client.request({ method: "session-get" });
  }
}
