import { z } from "zod";

export const QBittorrentConfigSchema = z.object({
  url: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

export const TorrentStateSchema = z.enum([
  "error",
  "missingFiles",
  "uploading",
  "stoppedUP",
  "queuedUP",
  "stalledUP",
  "checkingUP",
  "forcedUP",
  "allocating",
  "downloading",
  "metaDL",
  "forcedMetaDL",
  "stoppedDL",
  "queuedDL",
  "stalledDL",
  "checkingDL",
  "forcedDL",
  "checkingResumeData",
  "moving",
  "unknown",
]);

export const TorrentInfoSchema = z
  .object({
    hash: z.string(),
    infohash_v1: z.string(),
    infohash_v2: z.string(),
    name: z.string(),
    magnet_uri: z.string(),
    size: z.number(),
    total_size: z.number(),
    progress: z.number(),
    dlspeed: z.number(),
    upspeed: z.number(),
    priority: z.number(),
    num_seeds: z.number(),
    num_complete: z.number(),
    num_leechs: z.number(),
    num_incomplete: z.number(),
    ratio: z.number(),
    eta: z.number(),
    state: TorrentStateSchema,
    seq_dl: z.boolean(),
    f_l_piece_prio: z.boolean(),
    category: z.string(),
    tags: z.string(),
    super_seeding: z.boolean(),
    force_start: z.boolean(),
    save_path: z.string(),
    download_path: z.string(),
    content_path: z.string(),
    added_on: z.number(),
    completion_on: z.number(),
    tracker: z.string(),
    trackers_count: z.number(),
    dl_limit: z.number(),
    up_limit: z.number(),
    downloaded: z.number(),
    uploaded: z.number(),
    downloaded_session: z.number(),
    uploaded_session: z.number(),
    amount_left: z.number(),
    completed: z.number(),
    max_ratio: z.number(),
    max_seeding_time: z.number(),
    max_inactive_seeding_time: z.number(),
    ratio_limit: z.number(),
    seeding_time_limit: z.number(),
    inactive_seeding_time_limit: z.number(),
    seen_complete: z.number(),
    last_activity: z.number(),
    auto_tmm: z.boolean(),
    time_active: z.number(),
    seeding_time: z.number(),
    availability: z.number(),
    reannounce: z.number(),
    comment: z.string(),
    popularity: z.number(),
  })
  .passthrough();

export const TorrentInfoParamsSchema = z.object({
  filter: z
    .enum([
      "all",
      "downloading",
      "seeding",
      "completed",
      "stopped",
      "active",
      "inactive",
      "running",
      "stalled",
      "stalled_uploading",
      "stalled_downloading",
      "errored",
    ])
    .optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  sort: z.string().optional(),
  reverse: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  hashes: z.string().optional(),
});

export const TorrentPropertiesSchema = z
  .object({
    addition_date: z.number(),
    comment: z.string(),
    completion_date: z.number(),
    created_by: z.string(),
    creation_date: z.number(),
    dl_limit: z.number(),
    dl_speed: z.number(),
    dl_speed_avg: z.number(),
    eta: z.number(),
    isPrivate: z.boolean().optional(),
    last_seen: z.number(),
    nb_connections: z.number(),
    nb_connections_limit: z.number(),
    peers: z.number(),
    peers_total: z.number(),
    piece_size: z.number(),
    pieces_have: z.number(),
    pieces_num: z.number(),
    reannounce: z.number(),
    save_path: z.string(),
    seeding_time: z.number(),
    seeds: z.number(),
    seeds_total: z.number(),
    share_ratio: z.number(),
    time_elapsed: z.number(),
    total_downloaded: z.number(),
    total_downloaded_session: z.number(),
    total_size: z.number(),
    total_uploaded: z.number(),
    total_uploaded_session: z.number(),
    total_wasted: z.number(),
    up_limit: z.number(),
    up_speed: z.number(),
    up_speed_avg: z.number(),
  })
  .passthrough();

export const TorrentFileSchema = z
  .object({
    index: z.number(),
    name: z.string(),
    size: z.number(),
    progress: z.number(),
    priority: z.number(),
    is_seed: z.boolean(),
    piece_range: z.array(z.number()),
    availability: z.number(),
  })
  .passthrough();

export const TorrentTrackerSchema = z
  .object({
    url: z.string(),
    status: z.number(),
    tier: z.number(),
    num_peers: z.number(),
    num_seeds: z.number(),
    num_leeches: z.number(),
    num_downloaded: z.number(),
    msg: z.string(),
  })
  .passthrough();

export const TorrentPeerSchema = z
  .object({
    ip: z.string(),
    port: z.number(),
    client: z.string(),
    peer_id_client: z.string(),
    progress: z.number(),
    dl_speed: z.number(),
    up_speed: z.number(),
    downloaded: z.number(),
    uploaded: z.number(),
    connection: z.string(),
    flags: z.string(),
    flags_desc: z.string(),
    country: z.string(),
    country_code: z.string(),
    relevance: z.number(),
    files: z.string(),
  })
  .passthrough();

export const TorrentPeersResponseSchema = z
  .object({
    rid: z.number(),
    peers: z.record(z.string(), TorrentPeerSchema),
    peers_removed: z.array(z.string()).optional(),
    full_update: z.boolean().optional(),
  })
  .passthrough();

export const TransferInfoSchema = z
  .object({
    dl_info_speed: z.number(),
    dl_info_data: z.number(),
    up_info_speed: z.number(),
    up_info_data: z.number(),
    dl_rate_limit: z.number(),
    up_rate_limit: z.number(),
    dht_nodes: z.number(),
    connection_status: z.string(),
  })
  .passthrough();

export const PreferencesSchema = z
  .object({
    save_path: z.string(),
    temp_path_enabled: z.boolean(),
    temp_path: z.string(),
    start_paused_enabled: z.boolean().optional(),
    preallocate_all: z.boolean(),
    auto_tmm_enabled: z.boolean(),
    dl_limit: z.number(),
    up_limit: z.number(),
    alt_dl_limit: z.number(),
    alt_up_limit: z.number(),
    scheduler_enabled: z.boolean(),
    schedule_from_hour: z.number(),
    schedule_from_min: z.number(),
    schedule_to_hour: z.number(),
    schedule_to_min: z.number(),
    scheduler_days: z.number(),
    listen_port: z.number(),
    upnp: z.boolean(),
    random_port: z.boolean(),
    max_connec: z.number(),
    max_connec_per_torrent: z.number(),
    max_uploads: z.number(),
    max_uploads_per_torrent: z.number(),
    dht: z.boolean(),
    pex: z.boolean(),
    lsd: z.boolean(),
    encryption: z.number(),
    anonymous_mode: z.boolean(),
    max_ratio_enabled: z.boolean(),
    max_ratio: z.number(),
    max_ratio_act: z.number(),
    max_seeding_time_enabled: z.boolean(),
    max_seeding_time: z.number(),
    max_inactive_seeding_time_enabled: z.boolean().optional(),
    max_inactive_seeding_time: z.number().optional(),
    queueing_enabled: z.boolean(),
    max_active_downloads: z.number(),
    max_active_torrents: z.number(),
    max_active_uploads: z.number(),
    dont_count_slow_torrents: z.boolean(),
    slow_torrent_dl_rate_threshold: z.number(),
    slow_torrent_ul_rate_threshold: z.number(),
    slow_torrent_inactive_timer: z.number(),
    web_ui_port: z.number(),
  })
  .passthrough();

const TorrentFileInputBlobSchema = z.custom<Blob>(
  (value) => typeof Blob !== "undefined" && value instanceof Blob,
  "Expected Blob"
);

const TorrentFileInputObjectSchema = z.object({
  uri: z.string(),
  type: z.string(),
  name: z.string(),
});

export const TorrentFileInputSchema = z.union([
  TorrentFileInputBlobSchema,
  TorrentFileInputObjectSchema,
]);

export const AddTorrentParamsSchema = z.object({
  urls: z.string().optional(),
  torrents: TorrentFileInputSchema.optional(),
  savepath: z.string().optional(),
  cookie: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  skip_checking: z.boolean().optional(),
  paused: z.boolean().optional(),
  root_folder: z.boolean().optional(),
  rename: z.string().optional(),
  upLimit: z.number().optional(),
  dlLimit: z.number().optional(),
  ratioLimit: z.number().optional(),
  seedingTimeLimit: z.number().optional(),
  autoTMM: z.boolean().optional(),
  sequentialDownload: z.boolean().optional(),
  firstLastPiecePrio: z.boolean().optional(),
});

export type QBittorrentConfig = z.infer<typeof QBittorrentConfigSchema>;
export type TorrentState = z.infer<typeof TorrentStateSchema>;
export type TorrentInfo = z.infer<typeof TorrentInfoSchema>;
export type TorrentInfoParams = z.infer<typeof TorrentInfoParamsSchema>;
export type TorrentProperties = z.infer<typeof TorrentPropertiesSchema>;
export type TorrentFile = z.infer<typeof TorrentFileSchema>;
export type TorrentTracker = z.infer<typeof TorrentTrackerSchema>;
export type TorrentPeer = z.infer<typeof TorrentPeerSchema>;
export type TorrentPeersResponse = z.infer<typeof TorrentPeersResponseSchema>;
export type TransferInfo = z.infer<typeof TransferInfoSchema>;
export type Preferences = z.infer<typeof PreferencesSchema>;
export type TorrentFileInput = z.infer<typeof TorrentFileInputSchema>;
export type AddTorrentParams = z.infer<typeof AddTorrentParamsSchema>;
