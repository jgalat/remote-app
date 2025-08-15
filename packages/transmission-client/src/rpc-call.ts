import type {
  SessionGetRequest,
  SessionGetResponse,
  SessionSetRequest,
  SessionStatsResponse,
  SessionCloseRequest,
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
  TorrentRenamePathRequest,
  TorrentRenamePathResponse,
  QueueMoveTopRequest,
  QueueMoveUpRequest,
  QueueMoveDownRequest,
  QueueMoveBottomRequest,
  BlocklistUpdateRequest,
  BlocklistUpdateResponse,
  PortTestRequest,
  PortTestResponse,
  GroupGetRequest,
  GroupGetResponse,
  GroupSetRequest,
} from "./rpc-calls";

type SessionMethods =
  | "session-get"
  | "session-set"
  | "session-stats"
  | "session-close"
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
  | "torrent-set-location"
  | "torrent-rename-path";

type QueueMethods =
  | "queue-move-top"
  | "queue-move-up"
  | "queue-move-down"
  | "queue-move-bottom";

type OtherMethods =
  | "blocklist-update"
  | "port-test"
  | "group-get"
  | "group-set";

export type Methods = SessionMethods | TorrentMethods | QueueMethods | OtherMethods;

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
  "session-close": SessionCloseRequest;
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
  "torrent-rename-path": TorrentRenamePathRequest;
  "queue-move-top": QueueMoveTopRequest;
  "queue-move-up": QueueMoveUpRequest;
  "queue-move-down": QueueMoveDownRequest;
  "queue-move-bottom": QueueMoveBottomRequest;
  "blocklist-update": BlocklistUpdateRequest;
  "port-test": PortTestRequest;
  "group-get": GroupGetRequest;
  "group-set": GroupSetRequest;
};

export type MethodResponse = {
  "session-get": SessionGetResponse;
  "session-set": void;
  "session-stats": SessionStatsResponse;
  "session-close": void;
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
  "torrent-rename-path": TorrentRenamePathResponse;
  "queue-move-top": void;
  "queue-move-up": void;
  "queue-move-down": void;
  "queue-move-bottom": void;
  "blocklist-update": BlocklistUpdateResponse;
  "port-test": PortTestResponse;
  "group-get": GroupGetResponse;
  "group-set": void;
};

export type Calls = {
  [K in Methods]: RPCCall<K, MethodRequest[K], MethodResponse[K]>;
};
