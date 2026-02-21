export { QBittorrentClient as default } from "./client";

export type {
  QBittorrentConfig,
  TorrentState,
  TorrentInfo,
  TorrentInfoParams,
  TorrentProperties,
  TorrentFile,
  TorrentTracker,
  TorrentPeer,
  TorrentPeersResponse,
  TransferInfo,
  Preferences,
  AddTorrentParams,
  TorrentFileInput,
} from "./types";

export { HTTPError, QBittorrentError } from "./error";
