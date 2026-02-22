import { z } from "zod";

import { Mode, Priority, TorrentStatus } from "./rpc-calls/torrent-get";

const IdentifierIdsSchema = z.union([
  z.number(),
  z.array(z.union([z.number(), z.string()])),
  z.literal("recently-active"),
]);

const IdentifiersSchema = z.object({
  ids: IdentifierIdsSchema.optional(),
});

const UnitsSchema = z
  .object({
    "speed-units": z.array(z.string()),
    "speed-bytes": z.number(),
    "size-units": z.array(z.string()),
    "size-bytes": z.number(),
    "memory-units": z.array(z.string()),
    "memory-bytes": z.number(),
  })
  .passthrough();

export const SessionGetResponseSchema = z
  .object({
    "alt-speed-down": z.number().optional(),
    "alt-speed-enabled": z.boolean().optional(),
    "alt-speed-time-begin": z.number().optional(),
    "alt-speed-time-enabled": z.boolean().optional(),
    "alt-speed-time-end": z.number().optional(),
    "alt-speed-time-day": z.number().optional(),
    "alt-speed-up": z.number().optional(),
    "blocklist-url": z.string().optional(),
    "blocklist-enabled": z.boolean().optional(),
    "blocklist-size": z.number().optional(),
    "cache-size-mb": z.number().optional(),
    "config-dir": z.string().optional(),
    "default-trackers": z.string().optional(),
    "dht-enabled": z.boolean().optional(),
    "download-dir": z.string().optional(),
    "download-dir-free-space": z.number().optional(),
    "download-queue-size": z.number().optional(),
    "download-queue-enabled": z.boolean().optional(),
    encryption: z.string().optional(),
    "idle-seeding-limit": z.number().optional(),
    "idle-seeding-limit-enabled": z.boolean().optional(),
    "incomplete-dir": z.string().optional(),
    "incomplete-dir-enabled": z.boolean().optional(),
    "lpd-enabled": z.boolean().optional(),
    "peer-limit-global": z.number().optional(),
    "peer-limit-per-torrent": z.number().optional(),
    "pex-enabled": z.boolean().optional(),
    "peer-port": z.number().optional(),
    "peer-port-random-on-start": z.boolean().optional(),
    "port-forwarding-enabled": z.boolean().optional(),
    "queue-stalled-enabled": z.boolean().optional(),
    "queue-stalled-minutes": z.number().optional(),
    "rename-partial-files": z.boolean().optional(),
    reqq: z.number().optional(),
    "rpc-version": z.number().optional(),
    "rpc-version-minimum": z.number().optional(),
    "rpc-version-semver": z.string().optional(),
    "script-torrent-added-enabled": z.boolean().optional(),
    "script-torrent-added-filename": z.string().optional(),
    "script-torrent-done-filename": z.string().optional(),
    "script-torrent-done-enabled": z.boolean().optional(),
    "script-torrent-done-seeding-enabled": z.boolean().optional(),
    "script-torrent-done-seeding-filename": z.string().optional(),
    seedRatioLimit: z.number().optional(),
    seedRatioLimited: z.boolean().optional(),
    "seed-queue-size": z.number().optional(),
    "seed-queue-enabled": z.boolean().optional(),
    "sequential-download": z.boolean().optional(),
    "session-id": z.string().optional(),
    "speed-limit-down": z.number().optional(),
    "speed-limit-down-enabled": z.boolean().optional(),
    "speed-limit-up": z.number().optional(),
    "speed-limit-up-enabled": z.boolean().optional(),
    "start-added-torrents": z.boolean().optional(),
    "trash-original-torrent-files": z.boolean().optional(),
    units: UnitsSchema.optional(),
    "utp-enabled": z.boolean().optional(),
    version: z.string().optional(),
  })
  .passthrough();

const SessionGetFieldSchema = z.enum([
  "alt-speed-down",
  "alt-speed-enabled",
  "alt-speed-time-begin",
  "alt-speed-time-enabled",
  "alt-speed-time-end",
  "alt-speed-time-day",
  "alt-speed-up",
  "blocklist-url",
  "blocklist-enabled",
  "blocklist-size",
  "cache-size-mb",
  "config-dir",
  "default-trackers",
  "dht-enabled",
  "download-dir",
  "download-dir-free-space",
  "download-queue-size",
  "download-queue-enabled",
  "encryption",
  "idle-seeding-limit",
  "idle-seeding-limit-enabled",
  "incomplete-dir",
  "incomplete-dir-enabled",
  "lpd-enabled",
  "peer-limit-global",
  "peer-limit-per-torrent",
  "pex-enabled",
  "peer-port",
  "peer-port-random-on-start",
  "port-forwarding-enabled",
  "queue-stalled-enabled",
  "queue-stalled-minutes",
  "rename-partial-files",
  "reqq",
  "rpc-version",
  "rpc-version-minimum",
  "rpc-version-semver",
  "script-torrent-added-enabled",
  "script-torrent-added-filename",
  "script-torrent-done-filename",
  "script-torrent-done-enabled",
  "script-torrent-done-seeding-enabled",
  "script-torrent-done-seeding-filename",
  "seedRatioLimit",
  "seedRatioLimited",
  "seed-queue-size",
  "seed-queue-enabled",
  "sequential-download",
  "session-id",
  "speed-limit-down",
  "speed-limit-down-enabled",
  "speed-limit-up",
  "speed-limit-up-enabled",
  "start-added-torrents",
  "trash-original-torrent-files",
  "units",
  "utp-enabled",
  "version",
]);

export const SessionGetRequestSchema = z.object({
  fields: z.array(SessionGetFieldSchema).optional(),
});

export const SessionSetRequestSchema = SessionGetResponseSchema;

const StatsSchema = z
  .object({
    uploadedBytes: z.number(),
    downloadedBytes: z.number(),
    filesAdded: z.number(),
    sessionCount: z.number(),
    secondsActive: z.number(),
  })
  .passthrough();

export const SessionStatsResponseSchema = z
  .object({
    activeTorrentCount: z.number(),
    downloadSpeed: z.number(),
    pausedTorrentCount: z.number(),
    torrentCount: z.number(),
    uploadSpeed: z.number(),
    "cumulative-stats": StatsSchema,
    "current-stats": StatsSchema,
  })
  .passthrough();

export const SessionCloseRequestSchema = z.never();

export const FreeSpaceResponseSchema = z
  .object({
    path: z.string(),
    "size-bytes": z.number(),
  })
  .passthrough();

export const FreeSpaceRequestSchema = z.object({
  path: z.string(),
});

const FileSchema = z
  .object({
    bytesCompleted: z.number(),
    length: z.number(),
    name: z.string(),
    beginPiece: z.number().optional(),
    endPiece: z.number().optional(),
  })
  .passthrough();

const FileStatsSchema = z
  .object({
    bytesCompleted: z.number(),
    wanted: z.boolean(),
    priority: z.nativeEnum(Priority),
  })
  .passthrough();

const PeerSchema = z
  .object({
    address: z.string(),
    clientName: z.string(),
    clientIsChoked: z.boolean(),
    clientIsInterested: z.boolean(),
    flagStr: z.string(),
    isDownloadingFrom: z.boolean(),
    isEncrypted: z.boolean(),
    isIncoming: z.boolean(),
    isUploadingTo: z.boolean(),
    isUTP: z.boolean(),
    peerIsChoked: z.boolean(),
    peerIsInterested: z.boolean(),
    port: z.number(),
    progress: z.number(),
    rateToClient: z.number(),
    rateToPeer: z.number(),
  })
  .passthrough();

const PeersFromSchema = z
  .object({
    fromCache: z.number(),
    fromDht: z.number(),
    fromIncoming: z.number(),
    fromLpd: z.number(),
    fromLtep: z.number(),
    fromPex: z.number(),
    fromTracker: z.number(),
  })
  .passthrough();

const TrackerSchema = z
  .object({
    announce: z.string(),
    id: z.number(),
    scrape: z.string(),
    sitename: z.string().optional(),
    tier: z.number(),
  })
  .passthrough();

const TrackerStatsSchema = z
  .object({
    announce: z.string(),
    announceState: z.number(),
    downloadCount: z.number(),
    hasAnnounced: z.boolean(),
    hasScraped: z.boolean(),
    host: z.string(),
    id: z.number(),
    isBackup: z.boolean(),
    lastAnnouncePeerCount: z.number(),
    lastAnnounceResult: z.string(),
    lastAnnounceStartTime: z.number(),
    lastAnnounceSucceeded: z.boolean(),
    lastAnnounceTime: z.number(),
    lastAnnounceTimedOut: z.boolean(),
    lastScrapeResult: z.string(),
    lastScrapeStartTime: z.number(),
    lastScrapeSucceeded: z.boolean(),
    lastScrapeTime: z.number(),
    lastScrapeTimedOut: z.boolean(),
    leecherCount: z.number(),
    nextAnnounceTime: z.number(),
    nextScrapeTime: z.number(),
    scrape: z.string(),
    scrapeState: z.number(),
    seederCount: z.number(),
    sitename: z.string().optional(),
    tier: z.number(),
  })
  .passthrough();

export const TorrentSchema = z
  .object({
    activityDate: z.number().optional(),
    addedDate: z.number().optional(),
    availability: z.array(z.number()).optional(),
    bandwidthPriority: z.nativeEnum(Priority).optional(),
    comment: z.string().optional(),
    corruptEver: z.number().optional(),
    creator: z.string().optional(),
    dateCreated: z.number().optional(),
    desiredAvailable: z.number().optional(),
    doneDate: z.number().optional(),
    downloadDir: z.string().optional(),
    downloadedEver: z.number().optional(),
    downloadLimit: z.number().optional(),
    downloadLimited: z.boolean().optional(),
    editDate: z.number().optional(),
    error: z.number().optional(),
    errorString: z.string().optional(),
    eta: z.number().optional(),
    etaIdle: z.number().optional(),
    "file-count": z.number().optional(),
    files: z.array(FileSchema).optional(),
    fileStats: z.array(FileStatsSchema).optional(),
    group: z.string().optional(),
    hashString: z.string().optional(),
    haveUnchecked: z.number().optional(),
    haveValid: z.number().optional(),
    honorsSessionLimits: z.boolean().optional(),
    id: z.number().optional(),
    isFinished: z.boolean().optional(),
    isPrivate: z.boolean().optional(),
    isStalled: z.boolean().optional(),
    labels: z.array(z.string()).optional(),
    leftUntilDone: z.number().optional(),
    magnetLink: z.string().optional(),
    manualAnnounceTime: z.number().optional(),
    maxConnectedPeers: z.number().optional(),
    metadataPercentComplete: z.number().optional(),
    name: z.string().optional(),
    "peer-limit": z.number().optional(),
    peers: z.array(PeerSchema).optional(),
    peersConnected: z.number().optional(),
    peersFrom: PeersFromSchema.optional(),
    peersGettingFromUs: z.number().optional(),
    peersSendingToUs: z.number().optional(),
    percentComplete: z.number().optional(),
    percentDone: z.number().optional(),
    pieces: z.string().optional(),
    pieceCount: z.number().optional(),
    pieceSize: z.number().optional(),
    priorities: z.array(z.nativeEnum(Priority)).optional(),
    "primary-mime-type": z.string().optional(),
    queuePosition: z.number().optional(),
    rateDownload: z.number().optional(),
    rateUpload: z.number().optional(),
    recheckProgress: z.number().optional(),
    secondsDownloading: z.number().optional(),
    secondsSeeding: z.number().optional(),
    seedIdleLimit: z.number().optional(),
    seedIdleMode: z.nativeEnum(Mode).optional(),
    seedRatioLimit: z.number().optional(),
    seedRatioMode: z.nativeEnum(Mode).optional(),
    sequentialDownload: z.boolean().optional(),
    sizeWhenDone: z.number().optional(),
    startDate: z.number().optional(),
    status: z.nativeEnum(TorrentStatus).optional(),
    trackers: z.array(TrackerSchema).optional(),
    trackerList: z.string().optional(),
    trackerStats: z.array(TrackerStatsSchema).optional(),
    totalSize: z.number().optional(),
    torrentFile: z.string().optional(),
    uploadedEver: z.number().optional(),
    uploadLimit: z.number().optional(),
    uploadLimited: z.boolean().optional(),
    uploadRatio: z.number().optional(),
    wanted: z.array(z.number()).optional(),
    webseeds: z.array(z.string()).optional(),
    webseedsSendingToUs: z.number().optional(),
  })
  .passthrough();

export const TorrentFormatSchema = z.enum(["objects", "table"]);

const TorrentFieldSchema = z.enum([
  "activityDate",
  "addedDate",
  "availability",
  "bandwidthPriority",
  "comment",
  "corruptEver",
  "creator",
  "dateCreated",
  "desiredAvailable",
  "doneDate",
  "downloadDir",
  "downloadedEver",
  "downloadLimit",
  "downloadLimited",
  "editDate",
  "error",
  "errorString",
  "eta",
  "etaIdle",
  "file-count",
  "files",
  "fileStats",
  "group",
  "hashString",
  "haveUnchecked",
  "haveValid",
  "honorsSessionLimits",
  "id",
  "isFinished",
  "isPrivate",
  "isStalled",
  "labels",
  "leftUntilDone",
  "magnetLink",
  "manualAnnounceTime",
  "maxConnectedPeers",
  "metadataPercentComplete",
  "name",
  "peer-limit",
  "peers",
  "peersConnected",
  "peersFrom",
  "peersGettingFromUs",
  "peersSendingToUs",
  "percentComplete",
  "percentDone",
  "pieces",
  "pieceCount",
  "pieceSize",
  "priorities",
  "primary-mime-type",
  "queuePosition",
  "rateDownload",
  "rateUpload",
  "recheckProgress",
  "secondsDownloading",
  "secondsSeeding",
  "seedIdleLimit",
  "seedIdleMode",
  "seedRatioLimit",
  "seedRatioMode",
  "sequentialDownload",
  "sizeWhenDone",
  "startDate",
  "status",
  "trackers",
  "trackerList",
  "trackerStats",
  "totalSize",
  "torrentFile",
  "uploadedEver",
  "uploadLimit",
  "uploadLimited",
  "uploadRatio",
  "wanted",
  "webseeds",
  "webseedsSendingToUs",
]);

export const TorrentGetResponseSchema = z
  .object({
    torrents: z.array(TorrentSchema),
    removed: z.array(z.number()).optional(),
  })
  .passthrough();

export const TorrentGetRequestSchema = IdentifiersSchema.extend({
  fields: z.array(TorrentFieldSchema),
  format: TorrentFormatSchema.optional(),
});

export const TorrentStartRequestSchema = IdentifiersSchema;
export const TorrentStartNowRequestSchema = IdentifiersSchema;
export const TorrentStopRequestSchema = IdentifiersSchema;
export const TorrentVerifyRequestSchema = IdentifiersSchema;
export const TorrentReannounceRequestSchema = IdentifiersSchema;

export const TorrentSetRequestSchema = IdentifiersSchema.extend({
  bandwidthPriority: z.nativeEnum(Priority).optional(),
  downloadLimit: z.number().optional(),
  downloadLimited: z.boolean().optional(),
  "files-wanted": z.array(z.number()).optional(),
  "files-unwanted": z.array(z.number()).optional(),
  honorsSessionLimits: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
  location: z.string().optional(),
  "peer-limit": z.number().optional(),
  "priority-high": z.array(z.number()).optional(),
  "priority-low": z.array(z.number()).optional(),
  "priority-normal": z.array(z.number()).optional(),
  queuePosition: z.number().optional(),
  seedIdleLimit: z.number().optional(),
  seedIdleMode: z.nativeEnum(Mode).optional(),
  seedRatioLimit: z.number().optional(),
  seedRatioMode: z.nativeEnum(Mode).optional(),
  trackerAdd: z.array(z.string()).optional(),
  trackerRemove: z.array(z.number()).optional(),
  trackerReplace: z
    .array(
      z.object({
        id: z.number(),
        announce: z.string(),
      })
    )
    .optional(),
  trackerList: z.string().optional(),
  group: z.string().optional(),
  sequentialDownload: z.boolean().optional(),
  uploadLimit: z.number().optional(),
  uploadLimited: z.boolean().optional(),
});

const TorrentAddOptionalsSchema = z.object({
  cookies: z.string().optional(),
  "download-dir": z.string().optional(),
  labels: z.array(z.string()).optional(),
  paused: z.boolean().optional(),
  "peer-limit": z.number().optional(),
  bandwidthPriority: z.number().optional(),
  "files-wanted": z.array(z.number()).optional(),
  "files-unwanted": z.array(z.number()).optional(),
  "priority-high": z.array(z.number()).optional(),
  "priority-low": z.array(z.number()).optional(),
  "priority-normal": z.array(z.number()).optional(),
  "sequential-download": z.boolean().optional(),
});

export const TorrentAddRequestSchema = z.union([
  TorrentAddOptionalsSchema.extend({ filename: z.string() }),
  TorrentAddOptionalsSchema.extend({ metainfo: z.string() }),
]);

const TorrentAddResultSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    hashString: z.string().optional(),
  })
  .passthrough();

export const TorrentAddResponseSchema = z.union([
  z
    .object({
      "torrent-added": z.array(TorrentAddResultSchema),
    })
    .passthrough(),
  z
    .object({
      "torrent-duplicate": z.array(TorrentAddResultSchema),
    })
    .passthrough(),
]);

export const TorrentRemoveRequestSchema = IdentifiersSchema.extend({
  "delete-local-data": z.boolean().optional(),
});

export const TorrentSetLocationRequestSchema = IdentifiersSchema.extend({
  location: z.string(),
  move: z.boolean().optional(),
});

export const TorrentRenamePathRequestSchema = IdentifiersSchema.extend({
  path: z.string(),
  name: z.string(),
});

export const TorrentRenamePathResponseSchema = z
  .object({
    path: z.string(),
    name: z.string(),
    id: z.number(),
  })
  .passthrough();

export const QueueMoveTopRequestSchema = IdentifiersSchema;
export const QueueMoveUpRequestSchema = IdentifiersSchema;
export const QueueMoveDownRequestSchema = IdentifiersSchema;
export const QueueMoveBottomRequestSchema = IdentifiersSchema;

export const BlocklistUpdateRequestSchema = z.never();

export const BlocklistUpdateResponseSchema = z
  .object({
    "blocklist-size": z.number(),
  })
  .passthrough();

export const PortTestRequestSchema = z.object({
  ipProtocol: z.enum(["ipv4", "ipv6"]).optional(),
});

export const PortTestResponseSchema = z
  .object({
    "port-is-open": z.boolean(),
    ipProtocol: z.enum(["ipv4", "ipv6"]).optional(),
  })
  .passthrough();

export const BandwidthGroupSchema = z
  .object({
    honorsSessionLimits: z.boolean(),
    name: z.string(),
    "speed-limit-down-enabled": z.boolean(),
    "speed-limit-down": z.number(),
    "speed-limit-up-enabled": z.boolean(),
    "speed-limit-up": z.number(),
  })
  .passthrough();

export const GroupGetRequestSchema = z.object({
  group: z.union([z.string(), z.array(z.string())]).optional(),
});

export const GroupGetResponseSchema = z
  .object({
    group: z.array(BandwidthGroupSchema),
  })
  .passthrough();

export const GroupSetRequestSchema = z.object({
  honorsSessionLimits: z.boolean().optional(),
  name: z.string(),
  "speed-limit-down-enabled": z.boolean().optional(),
  "speed-limit-down": z.number().optional(),
  "speed-limit-up-enabled": z.boolean().optional(),
  "speed-limit-up": z.number().optional(),
});

export type SessionGetRequest = z.infer<typeof SessionGetRequestSchema>;
export type SessionGetResponse = z.infer<typeof SessionGetResponseSchema>;
export type SessionSetRequest = z.infer<typeof SessionSetRequestSchema>;
export type SessionStatsResponse = z.infer<typeof SessionStatsResponseSchema>;
export type SessionCloseRequest = z.infer<typeof SessionCloseRequestSchema>;
export type FreeSpaceRequest = z.infer<typeof FreeSpaceRequestSchema>;
export type FreeSpaceResponse = z.infer<typeof FreeSpaceResponseSchema>;
export type TorrentStartRequest = z.infer<typeof TorrentStartRequestSchema>;
export type TorrentStartNowRequest = z.infer<typeof TorrentStartNowRequestSchema>;
export type TorrentStopRequest = z.infer<typeof TorrentStopRequestSchema>;
export type TorrentVerifyRequest = z.infer<typeof TorrentVerifyRequestSchema>;
export type TorrentReannounceRequest = z.infer<typeof TorrentReannounceRequestSchema>;
export type TorrentSetRequest = z.infer<typeof TorrentSetRequestSchema>;
export type TorrentGetRequest = z.infer<typeof TorrentGetRequestSchema>;
export type TorrentGetResponse = z.infer<typeof TorrentGetResponseSchema>;
export type TorrentAddRequest = z.infer<typeof TorrentAddRequestSchema>;
export type TorrentAddResponse = z.infer<typeof TorrentAddResponseSchema>;
export type TorrentRemoveRequest = z.infer<typeof TorrentRemoveRequestSchema>;
export type TorrentSetLocationRequest = z.infer<typeof TorrentSetLocationRequestSchema>;
export type TorrentRenamePathRequest = z.infer<typeof TorrentRenamePathRequestSchema>;
export type TorrentRenamePathResponse = z.infer<typeof TorrentRenamePathResponseSchema>;
export type QueueMoveTopRequest = z.infer<typeof QueueMoveTopRequestSchema>;
export type QueueMoveUpRequest = z.infer<typeof QueueMoveUpRequestSchema>;
export type QueueMoveDownRequest = z.infer<typeof QueueMoveDownRequestSchema>;
export type QueueMoveBottomRequest = z.infer<typeof QueueMoveBottomRequestSchema>;
export type BlocklistUpdateRequest = z.infer<typeof BlocklistUpdateRequestSchema>;
export type BlocklistUpdateResponse = z.infer<typeof BlocklistUpdateResponseSchema>;
export type PortTestRequest = z.infer<typeof PortTestRequestSchema>;
export type PortTestResponse = z.infer<typeof PortTestResponseSchema>;
export type GroupGetRequest = z.infer<typeof GroupGetRequestSchema>;
export type GroupGetResponse = z.infer<typeof GroupGetResponseSchema>;
export type BandwidthGroup = z.infer<typeof BandwidthGroupSchema>;
export type GroupSetRequest = z.infer<typeof GroupSetRequestSchema>;
export type Torrent = z.infer<typeof TorrentSchema>;
