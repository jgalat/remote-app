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
} from "./types";

export { HTTPError, QBittorrentError } from "./error";
