import type {
  SessionGetRequest,
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

export type RPCRequest<M, T> = {
  method: M;
  arguments?: T;
  tag?: number;
};

export type RPCResponse<A> = {
  result: string;
  arguments: A;
  tag?: number;
};

type RPCCall<M extends Methods, TRequest, TResponse> = (
  request: RPCRequest<M, TRequest>
) => RPCResponse<TResponse>;

export type MethodRequest = {
  "session-get": SessionGetRequest;
  "session-set": SessionSetRequest;
  "session-stats": never;
  "free-space": FreeSpaceRequest;
  "torrent-start": TorrentStartRequest;
  "torrent-start-now": TorrentStartNowRequest;
  "torrent-stop": TorrentStopRequest;
  "torrent-verify": TorrentVerifyRequest;
  "torrent-reannounce": TorrentReannounceRequest;
  "torrent-remove": TorrentRemoveRequest;
  "torrent-set-location": TorrentSetLocationRequest;
  "torrent-get": TorrentGetRequest;
  "torrent-add": TorrentAddRequest;
  "torrent-set": TorrentSetRequest;
};

export type MethodResponse = {
  "session-get": SessionGetResponse;
  "session-set": void;
  "session-stats": SessionStatsResponse;
  "free-space": FreeSpaceResponse;
  "torrent-start": void;
  "torrent-start-now": void;
  "torrent-stop": void;
  "torrent-verify": void;
  "torrent-reannounce": void;
  "torrent-remove": void;
  "torrent-set-location": void;
  "torrent-get": TorrentGetResponse;
  "torrent-add": TorrentAddResponse;
  "torrent-set": void;
};

export type Calls = {
  [K in Methods]: RPCCall<K, MethodRequest[K], MethodResponse[K]>;
};
