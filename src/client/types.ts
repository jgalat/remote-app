export { TorrentStatus, Priority, Mode } from "@remote-app/transmission-client";

export type TorrentId = number | string;

export type Torrent = {
  id: TorrentId;
  name: string;
  status: number;
  percentDone: number;
  rateDownload: number;
  rateUpload: number;
  totalSize: number;
  sizeWhenDone: number;
  leftUntilDone: number;
  eta: number;
  error: number;
  errorString: string;
  isFinished: boolean;
  peersConnected: number;
  peersGettingFromUs: number;
  peersSendingToUs: number;
  webseedsSendingToUs: number;
  uploadedEver: number;
  uploadRatio: number;
  recheckProgress: number;
  queuePosition: number;
  addedDate: number;
  doneDate: number;
  activityDate: number;
  magnetLink: string;
  downloadDir: string;
};

export type Peer = {
  address: string;
  port: number;
  clientName: string;
  isUTP: boolean;
  isEncrypted: boolean;
  rateToClient: number;
  rateToPeer: number;
  progress: number;
  flagStr: string;
};

export type TrackerStats = {
  announce: string;
  tier: number;
  seederCount: number;
  leecherCount: number;
  downloadCount: number;
  lastAnnounceTime: number;
  lastAnnounceSucceeded: boolean;
  lastAnnouncePeerCount: number;
  lastAnnounceResult: string;
  nextAnnounceTime: number;
  lastScrapeTime: number;
  lastScrapeSucceeded: boolean;
  lastScrapeResult: string;
  nextScrapeTime: number;
  scrape: string;
};

export type FileInfo = {
  bytesCompleted: number;
  length: number;
  name: string;
};

export type FileStats = {
  bytesCompleted: number;
  wanted: boolean;
  priority: number;
};

export type ExtTorrent = Torrent & {
  files: FileInfo[];
  fileStats: FileStats[];
  peers: Peer[];
  trackerStats: TrackerStats[];
  downloadedEver: number;
  pieceCount: number;
  pieceSize: number;
  pieces: string;
  bandwidthPriority?: number;
  honorsSessionLimits?: boolean;
  downloadLimited: boolean;
  downloadLimit: number;
  uploadLimited: boolean;
  uploadLimit: number;
  seedRatioMode: number;
  seedRatioLimit: number;
  seedIdleMode: number;
  seedIdleLimit: number;
};

export type Session = {
  "speed-limit-down-enabled": boolean;
  "speed-limit-down": number;
  "speed-limit-up-enabled": boolean;
  "speed-limit-up": number;
  "alt-speed-enabled": boolean;
  "alt-speed-down": number;
  "alt-speed-up": number;
  "alt-speed-time-enabled": boolean;
  "alt-speed-time-begin": number;
  "alt-speed-time-end": number;
  "alt-speed-time-day": number;
  seedRatioLimited: boolean;
  seedRatioLimit: number;
  "idle-seeding-limit-enabled": boolean;
  "idle-seeding-limit": number;
  "download-queue-enabled": boolean;
  "download-queue-size": number;
  "seed-queue-enabled": boolean;
  "seed-queue-size": number;
  "dht-enabled": boolean;
  "lpd-enabled": boolean;
  "pex-enabled": boolean;
  "download-dir": string;
};

export type SessionStats = {
  activeTorrentCount: number;
  pausedTorrentCount: number;
  torrentCount: number;
  downloadSpeed: number;
  uploadSpeed: number;
};

export type AddTorrentParams = {
  filename?: string;
  metainfo?: string;
  "download-dir"?: string;
  paused?: boolean;
};

export type AddTorrentResult = {
  id: TorrentId;
  name: string;
};

export type SetTorrentParams = {
  bandwidthPriority?: number;
  downloadLimit?: number;
  downloadLimited?: boolean;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  honorsSessionLimits?: boolean;
  "priority-high"?: number[];
  "priority-low"?: number[];
  "priority-normal"?: number[];
  seedIdleLimit?: number;
  seedIdleMode?: number;
  seedRatioLimit?: number;
  seedRatioMode?: number;
  uploadLimit?: number;
  uploadLimited?: boolean;
};

export type QBitPreferences = {
  // Speed (KB/s, 0 = unlimited)
  dl_limit: number;
  up_limit: number;
  alt_dl_limit: number;
  alt_up_limit: number;
  scheduler_enabled: boolean;
  schedule_from_hour: number;
  schedule_from_min: number;
  schedule_to_hour: number;
  schedule_to_min: number;
  scheduler_days: number;

  // Seeding
  max_ratio_enabled: boolean;
  max_ratio: number;
  max_seeding_time_enabled: boolean;
  max_seeding_time: number;
  max_inactive_seeding_time_enabled: boolean;
  max_inactive_seeding_time: number;
  max_ratio_act: number;

  // Queueing
  queueing_enabled: boolean;
  max_active_downloads: number;
  max_active_uploads: number;
  max_active_torrents: number;

  // Connection (-1 = disabled)
  max_connec: number;
  max_connec_per_torrent: number;
  max_uploads: number;
  max_uploads_per_torrent: number;

  // Peer discovery
  dht: boolean;
  pex: boolean;
  lsd: boolean;
  encryption: number;
};

export type SetLocationParams = {
  ids: TorrentId[];
  location: string;
  move?: boolean;
};
