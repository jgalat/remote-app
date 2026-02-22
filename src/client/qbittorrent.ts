import QBittorrentClient from "@remote-app/qbittorrent-client";
import type {
  TorrentInfo,
  TorrentState,
  TorrentFileInput,
  TorrentFile,
  TorrentPeersResponse,
  TorrentTracker,
} from "@remote-app/qbittorrent-client";
import * as FileSystem from "expo-file-system/legacy";
import { randomUUID } from "expo-crypto";

import { TorrentStatus, Priority } from "./types";
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
  Peer,
  TrackerStats,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
  Session,
  SessionStats,
  QBitPreferences,
} from "./types";

const stateMap: Record<TorrentState, TorrentStatus> = {
  downloading: TorrentStatus.DOWNLOADING,
  forcedDL: TorrentStatus.DOWNLOADING,
  metaDL: TorrentStatus.DOWNLOADING,
  forcedMetaDL: TorrentStatus.DOWNLOADING,
  stalledDL: TorrentStatus.DOWNLOADING,
  uploading: TorrentStatus.SEEDING,
  forcedUP: TorrentStatus.SEEDING,
  stalledUP: TorrentStatus.SEEDING,
  stoppedDL: TorrentStatus.STOPPED,
  stoppedUP: TorrentStatus.STOPPED,
  error: TorrentStatus.STOPPED,
  missingFiles: TorrentStatus.STOPPED,
  unknown: TorrentStatus.STOPPED,
  queuedDL: TorrentStatus.QUEUED_TO_DOWNLOAD,
  allocating: TorrentStatus.QUEUED_TO_DOWNLOAD,
  moving: TorrentStatus.QUEUED_TO_DOWNLOAD,
  queuedUP: TorrentStatus.QUEUED_TO_SEED,
  checkingDL: TorrentStatus.VERIFYING_LOCAL_DATA,
  checkingUP: TorrentStatus.VERIFYING_LOCAL_DATA,
  checkingResumeData: TorrentStatus.VERIFYING_LOCAL_DATA,
};

const QBIT_ETA_UNKNOWN = 8_640_000;
const CHARCODE_CHUNK_SIZE = 0x8000;

function mapTorrent(t: TorrentInfo): TorrentListItem {
  return {
    id: t.hash,
    name: t.name,
    status: stateMap[t.state],
    percentDone: t.progress,
    rateDownload: t.dlspeed,
    rateUpload: t.upspeed,
    totalSize: t.total_size,
    sizeWhenDone: t.size,
    leftUntilDone: t.amount_left,
    eta: t.eta === QBIT_ETA_UNKNOWN ? -1 : t.eta,
    error: t.state === "error" || t.state === "missingFiles" ? 1 : 0,
    errorString: t.state === "error" || t.state === "missingFiles" ? t.state : "",
    isFinished: t.state === "stoppedUP" && t.progress >= 1,
    peersConnected: t.num_seeds + t.num_leechs,
    peersGettingFromUs: t.num_leechs,
    peersSendingToUs: t.num_seeds,
    uploadedEver: t.uploaded,
    uploadRatio: t.ratio,
    queuePosition: t.priority,
    addedDate: t.added_on,
    doneDate: t.completion_on,
    activityDate: t.last_activity,
    magnetLink: t.magnet_uri,
    downloadDir: t.save_path,
  };
}

function mapSettings(t: TorrentInfo): TorrentSettingsDetail {
  const seedIdleRaw =
    t.inactive_seeding_time_limit ?? t.seeding_time_limit;

  return {
    downloadLimited: t.dl_limit > 0,
    downloadLimit: t.dl_limit > 0 ? Math.round(t.dl_limit / 1_024) : 0,
    uploadLimited: t.up_limit > 0,
    uploadLimit: t.up_limit > 0 ? Math.round(t.up_limit / 1_024) : 0,
    seedRatioMode: t.ratio_limit === -2 ? 0 : t.ratio_limit === -1 ? 2 : 1,
    seedRatioLimit: t.ratio_limit >= 0 ? t.ratio_limit : 0,
    seedIdleMode: seedIdleRaw === -2 ? 0 : seedIdleRaw === -1 ? 2 : 1,
    seedIdleLimit: seedIdleRaw >= 0 ? seedIdleRaw : 0,
  };
}

function mapFilePriority(qbitPriority: number): number {
  if (qbitPriority === 0) return Priority.LOW;
  if (qbitPriority >= 6) return Priority.HIGH;
  return Priority.NORMAL;
}

function mapFiles(qFiles: TorrentFile[]): TorrentFilesDetail {
  const files: TorrentFilesDetail["files"] = [];
  const fileStats: TorrentFilesDetail["fileStats"] = [];
  for (const f of qFiles) {
    const bytesCompleted = Math.round(f.progress * f.size);
    files.push({ bytesCompleted, length: f.size, name: f.name });
    fileStats.push({
      bytesCompleted,
      wanted: f.priority > 0,
      priority: mapFilePriority(f.priority),
    });
  }
  return { files, fileStats };
}

function mapPeers(peersResp: TorrentPeersResponse | null): TorrentPeersDetail {
  const peers: Peer[] = peersResp
    ? Object.values(peersResp.peers).map((p) => ({
        address: p.ip,
        port: p.port,
        clientName: p.client,
        isUTP: p.connection === "uTP",
        isEncrypted: p.flags.includes("E"),
        rateToClient: p.dl_speed,
        rateToPeer: p.up_speed,
        progress: p.progress,
      }))
    : [];
  return { peers };
}

function mapTrackers(qTrackers: TorrentTracker[]): TorrentTrackersDetail {
  const trackerStats: TrackerStats[] = qTrackers
    .filter(
      (t) =>
        t.url !== "** [DHT] **" &&
        t.url !== "** [PeX] **" &&
        t.url !== "** [LSD] **",
    )
    .map((t) => ({
      announce: t.url,
      tier: t.tier,
      seederCount: t.num_seeds,
      leecherCount: t.num_leeches,
      downloadCount: t.num_downloaded,
      lastAnnounceTime: 0,
      lastAnnounceSucceeded: t.status >= 2,
      lastAnnouncePeerCount: t.num_peers,
      lastAnnounceResult: t.msg || "OK",
      nextAnnounceTime: 0,
      lastScrapeTime: 0,
      lastScrapeSucceeded: t.status >= 2,
      lastScrapeResult: t.msg || "OK",
      nextScrapeTime: 0,
      scrape: "",
    }));
  return { trackerStats };
}

function pieceStatesToBitfield(states: number[]): string {
  const bytes = new Uint8Array(Math.ceil(states.length / 8));
  for (let i = 0; i < states.length; i++) {
    if (states[i] === 2) {
      bytes[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
    }
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHARCODE_CHUNK_SIZE) {
    const chunk = Array.from(bytes.slice(i, i + CHARCODE_CHUNK_SIZE));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export class QBittorrentAdapter implements TorrentClient {
  private client: QBittorrentClient;

  constructor(config: { url: string; username?: string; password?: string }) {
    this.client = new QBittorrentClient(config);
  }

  private async getInfoOrUndefined(hash: string): Promise<TorrentInfo | undefined> {
    const infos = await this.client.info({ hashes: hash });
    return infos[0];
  }

  async getTorrents(): Promise<TorrentListItem[]> {
    const torrents = await this.client.info();
    return torrents.map(mapTorrent);
  }

  async getTorrentInfo(id: TorrentId): Promise<TorrentInfoDetail | undefined> {
    const hash = String(id);
    const info = await this.getInfoOrUndefined(hash);
    if (!info) return undefined;

    const [props, qFiles, pieceStates] = await Promise.all([
      this.client.properties(hash),
      this.client.files(hash),
      this.client.pieceStates(hash).catch((): number[] => []),
    ]);

    return {
      ...mapTorrent(info),
      downloadedEver: props.total_downloaded,
      pieceCount: props.pieces_num,
      pieceSize: props.piece_size,
      pieces: pieceStatesToBitfield(pieceStates),
      filesCount: qFiles.length,
    };
  }

  async getTorrentSettings(id: TorrentId): Promise<TorrentSettingsDetail | undefined> {
    const hash = String(id);
    const info = await this.getInfoOrUndefined(hash);
    if (!info) return undefined;
    return mapSettings(info);
  }

  async getTorrentFiles(id: TorrentId): Promise<TorrentFilesDetail> {
    const hash = String(id);
    const qFiles = await this.client.files(hash);
    return mapFiles(qFiles);
  }

  async getTorrentPeers(id: TorrentId): Promise<TorrentPeersDetail> {
    const hash = String(id);
    const peersResp = await this.client
      .torrentPeers(hash)
      .catch((): TorrentPeersResponse | null => null);
    return mapPeers(peersResp);
  }

  async getTorrentTrackers(id: TorrentId): Promise<TorrentTrackersDetail> {
    const hash = String(id);
    const qTrackers = await this.client.trackers(hash);
    return mapTrackers(qTrackers);
  }

  async getTorrentPieces(id: TorrentId): Promise<TorrentPiecesDetail> {
    const hash = String(id);
    const [props, pieceStates] = await Promise.all([
      this.client.properties(hash),
      this.client.pieceStates(hash).catch((): number[] => []),
    ]);
    return {
      pieceCount: props.pieces_num,
      pieceSize: props.piece_size,
      pieces: pieceStatesToBitfield(pieceStates),
    };
  }

  async addTorrent(params: AddTorrentParams): Promise<AddTorrentResult | null> {
    const qParams: { urls?: string; torrents?: TorrentFileInput; savepath?: string; paused?: boolean } = {};
    let tempPath: string | undefined;

    if (params.filename) qParams.urls = params.filename;
    if (params.metainfo) {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) {
        throw new Error("Cache directory is unavailable");
      }

      tempPath = `${cacheDir}upload-${Date.now()}-${randomUUID()}.torrent`;
      await FileSystem.writeAsStringAsync(tempPath, params.metainfo, {
        encoding: FileSystem.EncodingType.Base64,
      });
      qParams.torrents = { uri: tempPath, type: "application/x-bittorrent", name: "torrent" };
    }
    if (params["download-dir"]) qParams.savepath = params["download-dir"];
    if (params.paused !== undefined) qParams.paused = params.paused;

    try {
      await this.client.add(qParams);
    } finally {
      if (tempPath) {
        await FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => {});
      }
    }

    return null;
  }

  async removeTorrents(ids: TorrentId[], deleteData = false): Promise<void> {
    await this.client.delete(ids.map(String), deleteData);
  }

  async startTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.start(ids.map(String));
  }

  async startTorrentsNow(ids: TorrentId[]): Promise<void> {
    const hashes = ids.map(String);
    await this.client.setForceStart(hashes, true);
  }

  async stopTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.stop(ids.map(String));
  }

  async verifyTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.recheck(ids.map(String));
  }

  async reannounceTorrents(ids: TorrentId[]): Promise<void> {
    await this.client.reannounce(ids.map(String));
  }

  async setTorrent(ids: TorrentId[], params: SetTorrentParams): Promise<void> {
    const hashes = ids.map(String);

    for (const hash of hashes) {
      if (params["files-wanted"]) {
        await this.client.filePrio(hash, params["files-wanted"], 1);
      }
      if (params["files-unwanted"]) {
        await this.client.filePrio(hash, params["files-unwanted"], 0);
      }
      if (params["priority-high"]) {
        await this.client.filePrio(hash, params["priority-high"], 6);
      }
      if (params["priority-normal"]) {
        await this.client.filePrio(hash, params["priority-normal"], 1);
      }
      if (params["priority-low"]) {
        // qBit has no "low" priority; 1 (normal) is the closest non-zero option
        await this.client.filePrio(hash, params["priority-low"], 1);
      }
    }

    if (params.downloadLimited !== undefined || params.downloadLimit !== undefined) {
      const limit =
        params.downloadLimited === false ? 0 : (params.downloadLimit ?? 0) * 1_024;
      await this.client.setDownloadLimit(hashes, limit);
    }

    if (params.uploadLimited !== undefined || params.uploadLimit !== undefined) {
      const limit =
        params.uploadLimited === false ? 0 : (params.uploadLimit ?? 0) * 1_024;
      await this.client.setUploadLimit(hashes, limit);
    }

    if (
      params.seedRatioMode !== undefined ||
      params.seedRatioLimit !== undefined ||
      params.seedIdleMode !== undefined ||
      params.seedIdleLimit !== undefined
    ) {
      const ratioMode = params.seedRatioMode ?? 0;
      const ratioLimit = ratioMode === 0 ? -2 : ratioMode === 2 ? -1 : (params.seedRatioLimit ?? -2);
      const idleMode = params.seedIdleMode ?? 0;
      const idleLimit = idleMode === 0 ? -2 : idleMode === 2 ? -1 : (params.seedIdleLimit ?? -2);
      await this.client.setShareLimits(hashes, ratioLimit, -2, idleLimit);
    }
  }

  async setLocation(params: SetLocationParams): Promise<void> {
    await this.client.setLocation(params.ids.map(String), params.location);
  }

  async queueMoveTop(ids: TorrentId[]): Promise<void> {
    await this.client.topPrio(ids.map(String));
  }

  async queueMoveUp(ids: TorrentId[]): Promise<void> {
    await this.client.increasePrio(ids.map(String));
  }

  async queueMoveDown(ids: TorrentId[]): Promise<void> {
    await this.client.decreasePrio(ids.map(String));
  }

  async queueMoveBottom(ids: TorrentId[]): Promise<void> {
    await this.client.bottomPrio(ids.map(String));
  }

  async getSession(): Promise<Session> {
    const [prefs, speedLimitsMode] = await Promise.all([
      this.client.preferences(),
      this.client.speedLimitsMode(),
    ]);
    return {
      "speed-limit-down-enabled": prefs.dl_limit > 0,
      "speed-limit-down": prefs.dl_limit > 0 ? Math.round(prefs.dl_limit / 1_024) : 0,
      "speed-limit-up-enabled": prefs.up_limit > 0,
      "speed-limit-up": prefs.up_limit > 0 ? Math.round(prefs.up_limit / 1_024) : 0,
      "alt-speed-enabled": speedLimitsMode === 1,
      "alt-speed-down": Math.round(prefs.alt_dl_limit / 1_024),
      "alt-speed-up": Math.round(prefs.alt_up_limit / 1_024),
      seedRatioLimited: prefs.max_ratio_enabled,
      seedRatioLimit: Math.max(prefs.max_ratio, 0),
      "idle-seeding-limit-enabled": prefs.max_seeding_time_enabled,
      "idle-seeding-limit": Math.max(prefs.max_seeding_time, 0),
      "download-queue-enabled": prefs.queueing_enabled,
      "download-queue-size": prefs.max_active_downloads,
      "seed-queue-enabled": prefs.queueing_enabled,
      "seed-queue-size": prefs.max_active_uploads,
      "alt-speed-time-enabled": false,
      "alt-speed-time-begin": 0,
      "alt-speed-time-end": 0,
      "alt-speed-time-day": 127,
      "dht-enabled": prefs.dht,
      "lpd-enabled": prefs.lsd,
      "pex-enabled": prefs.pex,
      "download-dir": prefs.save_path,
    };
  }

  async setSession(params: Partial<Session>): Promise<void> {
    const prefs: Record<string, unknown> = {};

    if (params["speed-limit-down-enabled"] !== undefined || params["speed-limit-down"] !== undefined) {
      const enabled = params["speed-limit-down-enabled"] ?? true;
      prefs.dl_limit = enabled ? (params["speed-limit-down"] ?? 0) * 1_024 : 0;
    }
    if (params["speed-limit-up-enabled"] !== undefined || params["speed-limit-up"] !== undefined) {
      const enabled = params["speed-limit-up-enabled"] ?? true;
      prefs.up_limit = enabled ? (params["speed-limit-up"] ?? 0) * 1_024 : 0;
    }
    if (params["alt-speed-enabled"] !== undefined) {
      const mode = await this.client.speedLimitsMode();
      const enabled = mode === 1;
      if (enabled !== params["alt-speed-enabled"]) {
        await this.client.toggleSpeedLimitsMode();
      }
    }
    if (params["alt-speed-down"] !== undefined) prefs.alt_dl_limit = params["alt-speed-down"] * 1_024;
    if (params["alt-speed-up"] !== undefined) prefs.alt_up_limit = params["alt-speed-up"] * 1_024;
    if (params.seedRatioLimited !== undefined) prefs.max_ratio_enabled = params.seedRatioLimited;
    if (params.seedRatioLimit !== undefined) prefs.max_ratio = params.seedRatioLimit;
    if (params["idle-seeding-limit-enabled"] !== undefined) prefs.max_seeding_time_enabled = params["idle-seeding-limit-enabled"];
    if (params["idle-seeding-limit"] !== undefined) prefs.max_seeding_time = params["idle-seeding-limit"];
    if (params["download-queue-enabled"] !== undefined) prefs.queueing_enabled = params["download-queue-enabled"];
    if (params["download-queue-size"] !== undefined) prefs.max_active_downloads = params["download-queue-size"];
    if (params["seed-queue-size"] !== undefined) prefs.max_active_uploads = params["seed-queue-size"];
    if (params["dht-enabled"] !== undefined) prefs.dht = params["dht-enabled"];
    if (params["lpd-enabled"] !== undefined) prefs.lsd = params["lpd-enabled"];
    if (params["pex-enabled"] !== undefined) prefs.pex = params["pex-enabled"];

    if (Object.keys(prefs).length > 0) {
      await this.client.setPreferences(prefs);
    }
  }

  async getPreferences(): Promise<Record<string, unknown>> {
    const p = await this.client.preferences();
    const maxInactiveSeedingTime = p.max_inactive_seeding_time ?? -1;
    const result: QBitPreferences = {
      dl_limit: Math.round(p.dl_limit / 1_024),
      up_limit: Math.round(p.up_limit / 1_024),
      alt_dl_limit: Math.round(p.alt_dl_limit / 1_024),
      alt_up_limit: Math.round(p.alt_up_limit / 1_024),
      scheduler_enabled: p.scheduler_enabled,
      schedule_from_hour: p.schedule_from_hour,
      schedule_from_min: p.schedule_from_min,
      schedule_to_hour: p.schedule_to_hour,
      schedule_to_min: p.schedule_to_min,
      scheduler_days: p.scheduler_days,
      max_ratio_enabled: p.max_ratio_enabled,
      max_ratio: p.max_ratio >= 0 ? p.max_ratio : 1,
      max_ratio_act: p.max_ratio_act,
      max_seeding_time_enabled: p.max_seeding_time_enabled,
      max_seeding_time: p.max_seeding_time >= 0 ? p.max_seeding_time : 1_440,
      max_inactive_seeding_time_enabled: p.max_inactive_seeding_time_enabled ?? false,
      max_inactive_seeding_time: maxInactiveSeedingTime >= 0 ? maxInactiveSeedingTime : 1_440,
      queueing_enabled: p.queueing_enabled,
      max_active_downloads: p.max_active_downloads,
      max_active_uploads: p.max_active_uploads,
      max_active_torrents: p.max_active_torrents,
      max_connec: p.max_connec,
      max_connec_per_torrent: p.max_connec_per_torrent,
      max_uploads: p.max_uploads,
      max_uploads_per_torrent: p.max_uploads_per_torrent,
      dht: p.dht,
      pex: p.pex,
      lsd: p.lsd,
      encryption: p.encryption,
    };
    return { ...result };
  }

  async setPreferences(prefs: Record<string, unknown>): Promise<void> {
    const mapped: Record<string, unknown> = { ...prefs };

    const dlLimit = prefs.dl_limit;
    if (typeof dlLimit === "number") mapped.dl_limit = dlLimit * 1_024;

    const upLimit = prefs.up_limit;
    if (typeof upLimit === "number") mapped.up_limit = upLimit * 1_024;

    const altDlLimit = prefs.alt_dl_limit;
    if (typeof altDlLimit === "number") mapped.alt_dl_limit = altDlLimit * 1_024;

    const altUpLimit = prefs.alt_up_limit;
    if (typeof altUpLimit === "number") mapped.alt_up_limit = altUpLimit * 1_024;

    await this.client.setPreferences(mapped);
  }

  async getSessionStats(): Promise<SessionStats> {
    const [transfer, torrents] = await Promise.all([
      this.client.transferInfo(),
      this.client.info(),
    ]);

    const pausedTorrentCount = torrents.filter((t) => stateMap[t.state] === TorrentStatus.STOPPED).length;
    const torrentCount = torrents.length;

    return {
      activeTorrentCount: torrentCount - pausedTorrentCount,
      pausedTorrentCount,
      torrentCount,
      downloadSpeed: transfer.dl_info_speed,
      uploadSpeed: transfer.up_info_speed,
    };
  }

  async ping(): Promise<void> {
    await this.client.version();
  }
}
