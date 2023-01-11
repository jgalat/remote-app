import { Identifiers, Fields } from "./utils";

type File = {
  bytesCompleted: number;
  length: number;
  name: string;
};

type FileStats = {
  bytesCompleted: number;
  wanted: boolean;
  priority: number;
};

type Label = {
  label: string;
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
  tier: number;
};

type WebSeed = {
  webseed: string;
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

export type Torrent = {
  activityDate: number;
  addedDate: number;
  bandwidthPriority: number;
  comment: string;
  corruptEver: number;
  creator: string;
  dateCreated: number;
  desiredAvailable: number;
  doneDate: number;
  downloadDir: string;
  downloadedEver: number;
  downloadLimit: number;
  downloadLimited: boolean;
  editDate: number;
  error: number;
  errorString: string;
  eta: number;
  etaIdle: number;
  "file-count": number;
  files: File[];
  fileStats: FileStats[];
  hashString: string;
  haveUnchecked: number;
  haveValid: number;
  honorsSessionLimits: boolean;
  id: number;
  isFinished: boolean;
  isPrivate: boolean;
  isStalled: boolean;
  labels: Label[];
  leftUntilDone: number;
  magnetLink: string;
  manualAnnounceTime: number;
  maxConnectedPeers: number;
  metadataPercentComplete: number;
  name: string;
  peerLimit: number;
  peers: Peer[];
  peersConnected: number;
  peersFrom: PeersFrom;
  peersGettingFromUs: number;
  peersSendingToUs: number;
  percentDone: number;
  pieces: string;
  pieceCount: number;
  pieceSize: number;
  priorities: any[];
  "primary-mime-type": string;
  queuePosition: number;
  rateDownload: number;
  rateUpload: number;
  recheckProgress: number;
  secondsDownloading: number;
  secondsSeeding: number;
  seedIdleLimit: number;
  seedIdleMode: number;
  seedRatioLimit: number;
  seedRatioMode: number;
  sizeWhenDone: number;
  startDate: number;
  status: TorrentStatus;
  trackers: Tracker[];
  trackerStats: TrackerStats[];
  totalSize: number;
  torrentFile: string;
  uploadedEver: number;
  uploadLimit: number;
  uploadLimited: boolean;
  uploadRatio: number;
  wanted: boolean[];
  webseeds: WebSeed[];
  webseedsSendingToUs: number;
};

export type Response = {
  torrents: Torrent[];
};

export type Request = Identifiers & Fields<keyof Torrent>;
