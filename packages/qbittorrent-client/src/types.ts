export type QBittorrentConfig = {
  url: string;
  username?: string;
  password?: string;
};

export type TorrentState =
  | "error"
  | "missingFiles"
  | "uploading"
  | "stoppedUP"
  | "queuedUP"
  | "stalledUP"
  | "checkingUP"
  | "forcedUP"
  | "allocating"
  | "downloading"
  | "metaDL"
  | "forcedMetaDL"
  | "stoppedDL"
  | "queuedDL"
  | "stalledDL"
  | "checkingDL"
  | "forcedDL"
  | "checkingResumeData"
  | "moving"
  | "unknown";

export type TorrentInfo = {
  hash: string;
  infohash_v1: string;
  infohash_v2: string;
  name: string;
  magnet_uri: string;
  size: number;
  total_size: number;
  progress: number;
  dlspeed: number;
  upspeed: number;
  priority: number;
  num_seeds: number;
  num_complete: number;
  num_leechs: number;
  num_incomplete: number;
  ratio: number;
  eta: number;
  state: TorrentState;
  seq_dl: boolean;
  f_l_piece_prio: boolean;
  category: string;
  tags: string;
  super_seeding: boolean;
  force_start: boolean;
  save_path: string;
  download_path: string;
  content_path: string;
  added_on: number;
  completion_on: number;
  tracker: string;
  trackers_count: number;
  dl_limit: number;
  up_limit: number;
  downloaded: number;
  uploaded: number;
  downloaded_session: number;
  uploaded_session: number;
  amount_left: number;
  completed: number;
  max_ratio: number;
  max_seeding_time: number;
  max_inactive_seeding_time: number;
  ratio_limit: number;
  seeding_time_limit: number;
  inactive_seeding_time_limit: number;
  seen_complete: number;
  last_activity: number;
  auto_tmm: boolean;
  time_active: number;
  seeding_time: number;
  availability: number;
  reannounce: number;
  comment: string;
  popularity: number;
};

export type TorrentInfoParams = {
  filter?:
    | "all"
    | "downloading"
    | "seeding"
    | "completed"
    | "stopped"
    | "active"
    | "inactive"
    | "running"
    | "stalled"
    | "stalled_uploading"
    | "stalled_downloading"
    | "errored";
  category?: string;
  tag?: string;
  sort?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
  hashes?: string;
};

export type TorrentProperties = {
  addition_date: number;
  comment: string;
  completion_date: number;
  created_by: string;
  creation_date: number;
  dl_limit: number;
  dl_speed: number;
  dl_speed_avg: number;
  eta: number;
  isPrivate?: boolean;
  last_seen: number;
  nb_connections: number;
  nb_connections_limit: number;
  peers: number;
  peers_total: number;
  piece_size: number;
  pieces_have: number;
  pieces_num: number;
  reannounce: number;
  save_path: string;
  seeding_time: number;
  seeds: number;
  seeds_total: number;
  share_ratio: number;
  time_elapsed: number;
  total_downloaded: number;
  total_downloaded_session: number;
  total_size: number;
  total_uploaded: number;
  total_uploaded_session: number;
  total_wasted: number;
  up_limit: number;
  up_speed: number;
  up_speed_avg: number;
};

export type TorrentFile = {
  index: number;
  name: string;
  size: number;
  progress: number;
  priority: number;
  is_seed: boolean;
  piece_range: number[];
  availability: number;
};

export type TorrentTracker = {
  url: string;
  status: number;
  tier: number;
  num_peers: number;
  num_seeds: number;
  num_leeches: number;
  num_downloaded: number;
  msg: string;
};

export type TorrentPeer = {
  ip: string;
  port: number;
  client: string;
  peer_id_client: string;
  progress: number;
  dl_speed: number;
  up_speed: number;
  downloaded: number;
  uploaded: number;
  connection: string;
  flags: string;
  flags_desc: string;
  country: string;
  country_code: string;
  relevance: number;
  files: string;
};

export type TorrentPeersResponse = {
  rid: number;
  peers: Record<string, TorrentPeer>;
  peers_removed?: string[];
  full_update?: boolean;
};

export type TransferInfo = {
  dl_info_speed: number;
  dl_info_data: number;
  up_info_speed: number;
  up_info_data: number;
  dl_rate_limit: number;
  up_rate_limit: number;
  dht_nodes: number;
  connection_status: string;
};

export type Preferences = {
  save_path: string;
  temp_path_enabled: boolean;
  temp_path: string;
  start_paused_enabled?: boolean;
  preallocate_all: boolean;
  auto_tmm_enabled: boolean;
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
  listen_port: number;
  upnp: boolean;
  random_port: boolean;
  max_connec: number;
  max_connec_per_torrent: number;
  max_uploads: number;
  max_uploads_per_torrent: number;
  dht: boolean;
  pex: boolean;
  lsd: boolean;
  encryption: number;
  anonymous_mode: boolean;
  max_ratio_enabled: boolean;
  max_ratio: number;
  max_ratio_act: number;
  max_seeding_time_enabled: boolean;
  max_seeding_time: number;
  queueing_enabled: boolean;
  max_active_downloads: number;
  max_active_torrents: number;
  max_active_uploads: number;
  dont_count_slow_torrents: boolean;
  slow_torrent_dl_rate_threshold: number;
  slow_torrent_ul_rate_threshold: number;
  slow_torrent_inactive_timer: number;
  web_ui_port: number;
};

export type AddTorrentParams = {
  urls?: string;
  torrents?: Blob;
  savepath?: string;
  cookie?: string;
  category?: string;
  tags?: string;
  skip_checking?: boolean;
  paused?: boolean;
  root_folder?: boolean;
  rename?: string;
  upLimit?: number;
  dlLimit?: number;
  ratioLimit?: number;
  seedingTimeLimit?: number;
  autoTMM?: boolean;
  sequentialDownload?: boolean;
  firstLastPiecePrio?: boolean;
};
