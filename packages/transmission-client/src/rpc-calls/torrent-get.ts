import { Identifiers, Fields } from "./utils";

type File = {
  bytesCompleted: number;
  length: number;
  name: string;
  beginPiece?: number;
  endPiece?: number;
};

type FileStats = {
  bytesCompleted: number;
  wanted: boolean;
  priority: Priority;
};

type Peer = {
  address: string;
  clientName: string;
  clientIsChoked: boolean;
  clientIsInterested: boolean;
  flagStr: string;
  isDownloadingFrom: boolean;
  isEncrypted: boolean;
  isIncoming: boolean;
  isUploadingTo: boolean;
  isUTP: boolean;
  peerIsChoked: boolean;
  peerIsInterested: boolean;
  port: number;
  progress: number;
  rateToClient: number;
  rateToPeer: number;
};

type PeersFrom = {
  fromCache: number;
  fromDht: number;
  fromIncoming: number;
  fromLpd: number;
  fromLtep: number;
  fromPex: number;
  fromTracker: number;
};

type Tracker = {
  announce: string;
  id: number;
  scrape: string;
  sitename?: string;
  tier: number;
};

type TrackerStats = {
  announce: string;
  announceState: number;
  downloadCount: number;
  hasAnnounced: boolean;
  hasScraped: boolean;
  host: string;
  id: number;
  isBackup: boolean;
  lastAnnouncePeerCount: number;
  lastAnnounceResult: string;
  lastAnnounceStartTime: number;
  lastAnnounceSucceeded: boolean;
  lastAnnounceTime: number;
  lastAnnounceTimedOut: boolean;
  lastScrapeResult: string;
  lastScrapeStartTime: number;
  lastScrapeSucceeded: boolean;
  lastScrapeTime: number;
  lastScrapeTimedOut: boolean;
  leecherCount: number;
  nextAnnounceTime: number;
  nextScrapeTime: number;
  scrape: string;
  scrapeState: number;
  seederCount: number;
  sitename?: string;
  tier: number;
};

export enum TorrentStatus {
  STOPPED,
  QUEUED_TO_VERIFY_LOCAL_DATA,
  VERIFYING_LOCAL_DATA,
  QUEUED_TO_DOWNLOAD,
  DOWNLOADING,
  QUEUED_TO_SEED,
  SEEDING,
}

export enum Priority {
  LOW = -1,
  NORMAL = 0,
  HIGH = 1,
}

export enum Mode {
  GLOBAL = 0,
  SINGLE = 1,
  UNLIMITED = 2,
}

export type Torrent = {
  activityDate?: number;
  addedDate?: number;
  availability?: number[];
  bandwidthPriority?: Priority;
  comment?: string;
  corruptEver?: number;
  creator?: string;
  dateCreated?: number;
  desiredAvailable?: number;
  doneDate?: number;
  downloadDir?: string;
  downloadedEver?: number;
  downloadLimit?: number;
  downloadLimited?: boolean;
  editDate?: number;
  error?: number;
  errorString?: string;
  eta?: number;
  etaIdle?: number;
  "file-count"?: number;
  files?: File[];
  fileStats?: FileStats[];
  group?: string;
  hashString?: string;
  haveUnchecked?: number;
  haveValid?: number;
  honorsSessionLimits?: boolean;
  id?: number;
  isFinished?: boolean;
  isPrivate?: boolean;
  isStalled?: boolean;
  labels?: string[];
  leftUntilDone?: number;
  magnetLink?: string;
  manualAnnounceTime?: number;
  maxConnectedPeers?: number;
  metadataPercentComplete?: number;
  name?: string;
  "peer-limit"?: number;
  peers?: Peer[];
  peersConnected?: number;
  peersFrom?: PeersFrom;
  peersGettingFromUs?: number;
  peersSendingToUs?: number;
  percentComplete?: number;
  percentDone?: number;
  pieces?: string;
  pieceCount?: number;
  pieceSize?: number;
  priorities?: Priority[];
  "primary-mime-type"?: string;
  queuePosition?: number;
  rateDownload?: number;
  rateUpload?: number;
  recheckProgress?: number;
  secondsDownloading?: number;
  secondsSeeding?: number;
  seedIdleLimit?: number;
  seedIdleMode?: Mode;
  seedRatioLimit?: number;
  seedRatioMode?: Mode;
  sequentialDownload?: boolean;
  sizeWhenDone?: number;
  startDate?: number;
  status?: TorrentStatus;
  trackers?: Tracker[];
  trackerList?: string;
  trackerStats?: TrackerStats[];
  totalSize?: number;
  torrentFile?: string;
  uploadedEver?: number;
  uploadLimit?: number;
  uploadLimited?: boolean;
  uploadRatio?: number;
  wanted?: number[];
  webseeds?: string[];
  webseedsSendingToUs?: number;
};

export type TorrentFormat = "objects" | "table";

export type Response = {
  torrents: Torrent[];
  removed?: number[];
};

export type Request = Identifiers &
  Fields<keyof Torrent> & {
    format?: TorrentFormat;
  };
