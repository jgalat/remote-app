import type {
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

export type RPCCall<A, B = void> = B extends void
  ? [RPCRequest<A>, void]
  : [RPCRequest<A>, RPCResponse<B>];

export type Mapping = {
  "session-get": RPCCall<never, SessionGetResponse>;
  "session-set": RPCCall<SessionSetRequest>;
  "session-stats": RPCCall<never, SessionStatsResponse>;
  "free-space": RPCCall<FreeSpaceRequest, FreeSpaceResponse>;
  "torrent-start": RPCCall<TorrentStartRequest>;
  "torrent-start-now": RPCCall<TorrentStartNowRequest>;
  "torrent-stop": RPCCall<TorrentStopRequest>;
  "torrent-verify": RPCCall<TorrentVerifyRequest>;
  "torrent-reannounce": RPCCall<TorrentReannounceRequest>;
  "torrent-remove": RPCCall<TorrentRemoveRequest>;
  "torrent-set-location": RPCCall<TorrentSetLocationRequest>;
  "torrent-get": RPCCall<TorrentGetRequest, TorrentGetResponse>;
  "torrent-add": RPCCall<TorrentAddRequest, TorrentAddResponse>;
  "torrent-set": RPCCall<TorrentSetRequest>;
};
