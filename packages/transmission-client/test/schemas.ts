import { z } from "zod";
import type { Torrent } from "../src/rpc-calls/torrent-get";
import type { Response as SessionGetResponse } from "../src/rpc-calls/session-get";
import type { Response as SessionStatsResponse } from "../src/rpc-calls/session-stats";
import type { Response as FreeSpaceResponse } from "../src/rpc-calls/free-space";

export const TorrentSchema: z.ZodType<Required<Pick<Torrent,
  "id" | "name" | "status" | "hashString" | "totalSize" | "percentDone" |
  "rateDownload" | "rateUpload" | "uploadedEver" | "downloadedEver" |
  "eta" | "error" | "errorString" | "addedDate" | "doneDate" |
  "downloadDir" | "isFinished" | "isStalled" | "queuePosition" |
  "uploadRatio" | "sizeWhenDone" | "leftUntilDone" | "peersConnected" |
  "peersSendingToUs" | "peersGettingFromUs" | "activityDate"
>>> = z.object({
  id: z.number(),
  name: z.string(),
  status: z.number(),
  hashString: z.string(),
  totalSize: z.number(),
  percentDone: z.number(),
  rateDownload: z.number(),
  rateUpload: z.number(),
  uploadedEver: z.number(),
  downloadedEver: z.number(),
  eta: z.number(),
  error: z.number(),
  errorString: z.string(),
  addedDate: z.number(),
  doneDate: z.number(),
  downloadDir: z.string(),
  isFinished: z.boolean(),
  isStalled: z.boolean(),
  queuePosition: z.number(),
  uploadRatio: z.number(),
  sizeWhenDone: z.number(),
  leftUntilDone: z.number(),
  peersConnected: z.number(),
  peersSendingToUs: z.number(),
  peersGettingFromUs: z.number(),
  activityDate: z.number(),
});

const UnitsSchema = z.object({
  "speed-units": z.array(z.string()),
  "speed-bytes": z.number(),
  "size-units": z.array(z.string()),
  "size-bytes": z.number(),
  "memory-units": z.array(z.string()),
  "memory-bytes": z.number(),
});

export const SessionGetResponseSchema: z.ZodType<SessionGetResponse> = z.object({
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
});

const StatsSchema = z.object({
  uploadedBytes: z.number(),
  downloadedBytes: z.number(),
  filesAdded: z.number(),
  sessionCount: z.number(),
  secondsActive: z.number(),
});

export const SessionStatsResponseSchema: z.ZodType<SessionStatsResponse> = z.object({
  activeTorrentCount: z.number(),
  downloadSpeed: z.number(),
  pausedTorrentCount: z.number(),
  torrentCount: z.number(),
  uploadSpeed: z.number(),
  "cumulative-stats": StatsSchema,
  "current-stats": StatsSchema,
});

export const FreeSpaceResponseSchema: z.ZodType<FreeSpaceResponse> = z.object({
  path: z.string(),
  "size-bytes": z.number(),
});
