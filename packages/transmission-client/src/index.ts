export type {
  SessionGetResponse,
  SessionSetRequest,
  SessionStatsResponse,
  FreeSpaceRequest,
  FreeSpaceResponse,
  TorrentStartRequest,
  TorrentStartNowRequest,
  TorrentStopRequest,
  TorrentVerifyRequest,
  TorrentReannounceRequest,
  TorrentSetRequest,
  TorrentGetRequest,
  TorrentGetResponse,
  TorrentAddRequest,
  TorrentAddResponse,
  TorrentRemoveRequest,
  TorrentSetLocationRequest,
} from "./rpc-calls";

export { TorrentStatus } from "./rpc-calls/torrent-get";

export type { Methods } from "./rpc-call";

export type { HTTPError, TransmissionError } from "./error";

export { TransmissionClient as default } from "./client";
