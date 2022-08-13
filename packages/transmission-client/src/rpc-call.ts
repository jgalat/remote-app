import type { Response as SessionGetResponse } from "./rpc-calls/session-get";

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
  | "torrent-remove"
  | "torrent-set-location"
  | "torrent-get"
  | "torrent-add"
  | "torrent-set";

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
  "session-set": RPCCall<string, number>;
  "session-stats": RPCCall<any, any>;
  "free-space": RPCCall<any, any>;
  "torrent-start": RPCCall<any, any>;
  "torrent-start-now": RPCCall<any, any>;
  "torrent-stop": RPCCall<any, any>;
  "torrent-verify": RPCCall<any, any>;
  "torrent-reannounce": RPCCall<any, any>;
  "torrent-remove": RPCCall<any, any>;
  "torrent-set-location": RPCCall<any, any>;
  "torrent-get": RPCCall<any, any>;
  "torrent-add": RPCCall<any, any>;
  "torrent-set": RPCCall<any, any>;
};
