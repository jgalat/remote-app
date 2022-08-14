export type { Response as SessionGetResponse } from "./rpc-calls/session-get";
export type { Request as SessionSetRequest } from "./rpc-calls/session-set";
export type { Response as SessionStatsResponse } from "./rpc-calls/session-stats";
export type {
  Request as FreeSpaceRequest,
  Response as FreeSpaceResponse,
} from "./rpc-calls/free-space";
export type { Request as TorrentStartRequest } from "./rpc-calls/torrent-start";
export type { Request as TorrentStartNowRequest } from "./rpc-calls/torrent-start-now";
export type { Request as TorrentStopRequest } from "./rpc-calls/torrent-stop";
export type { Request as TorrentVerifyRequest } from "./rpc-calls/torrent-verify";
export type { Request as TorrentReannounceRequest } from "./rpc-calls/torrent-reannounce";
export type { Request as TorrentSetRequest } from "./rpc-calls/torrent-set";
export type {
  Request as TorrentGetRequest,
  Response as TorrentGetResponse,
} from "./rpc-calls/torrent-get";
export type {
  Request as TorrentAddRequest,
  Response as TorrentAddResponse,
} from "./rpc-calls/torrent-add";
export type { Request as TorrentRemoveRequest } from "./rpc-calls/torrent-remove";
export type { Request as TorrentSetLocationRequest } from "./rpc-calls/torrent-set-location";

export { TransmissionClient as default } from "./client";
