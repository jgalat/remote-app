import type { Response as SessionGetResponse } from "./rpc-calls/session-get";
import type { Request as SessionSetRequest } from "./rpc-calls/session-set";
import type { Response as SessionStatsResponse } from "./rpc-calls/session-stats";
import type { Request as FreeSpaceRequest, Response as FreeSpaceResponse } from "./rpc-calls/free-space";
import type { Request as TorrentStartRequest } from "./rpc-calls/torrent-start";
import type { Request as TorrentStartNowRequest } from "./rpc-calls/torrent-start-now";
import type { Request as TorrentStopRequest } from "./rpc-calls/torrent-stop";
import type { Request as TorrentVerifyRequest } from "./rpc-calls/torrent-verify";
import type { Request as TorrentReannounceRequest } from "./rpc-calls/torrent-reannounce";
import type { Request as TorrentSetRequest } from "./rpc-calls/torrent-set";
import type { Request as TorrentGetRequest, Response as TorrentGetResponse } from "./rpc-calls/torrent-get";
import type { Request as TorrentAddRequest, Response as TorrentAddResponse } from "./rpc-calls/torrent-add";
import type { Request as TorrentRemoveRequest } from "./rpc-calls/torrent-remove";
import type { Request as TorrentSetLocationRequest } from "./rpc-calls/torrent-set-location";

type SessionMethods =
  | "session-get"
  | "session-set"
  | "session-stats"
  | "free-space";

type TorrentMethods =
  | "torrent-start"
  | "torrent-start-now"
  | "torrent-stop"
  | "torrent-verify"
  | "torrent-reannounce"
  | "torrent-set"
  | "torrent-get"
  | "torrent-add"
  | "torrent-remove"
  | "torrent-set-location";

export type Methods = SessionMethods | TorrentMethods;

export type RPCRequest<A> = {
  method: Methods;
  arguments?: A;
  tag?: number;
};

export type RPCResponse<B> = {
  result: "success" | string;
  arguments?: B;
  tag?: number;
};

export type RPCCall<A, B> = [RPCRequest<A>, RPCResponse<B>];

export type Mapping = {
  "session-get": RPCCall<never, SessionGetResponse>;
  "session-set": RPCCall<SessionSetRequest, never>;
  "session-stats": RPCCall<never, SessionStatsResponse>;
  "free-space": RPCCall<FreeSpaceRequest, FreeSpaceResponse>;
  "torrent-start": RPCCall<TorrentStartRequest, never>;
  "torrent-start-now": RPCCall<TorrentStartNowRequest, never>;
  "torrent-stop": RPCCall<TorrentStopRequest, never>;
  "torrent-verify": RPCCall<TorrentVerifyRequest, never>;
  "torrent-reannounce": RPCCall<TorrentReannounceRequest, never>;
  "torrent-remove": RPCCall<TorrentRemoveRequest, never>;
  "torrent-set-location": RPCCall<TorrentSetLocationRequest, never>;
  "torrent-get": RPCCall<TorrentGetRequest, TorrentGetResponse>;
  "torrent-add": RPCCall<TorrentAddRequest, TorrentAddResponse>;
  "torrent-set": RPCCall<TorrentSetRequest, never>;
};
