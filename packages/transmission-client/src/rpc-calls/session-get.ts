type Units = {
  "speed-units": string[];
  "speed-bytes": number;
  "size-units": string[];
  "size-bytes": number;
  "memory-units": string[];
  "memory-bytes": number;
};

export type Response = {
  "alt-speed-down"?: number;
  "alt-speed-enabled"?: boolean;
  "alt-speed-time-begin"?: number;
  "alt-speed-time-enabled"?: boolean;
  "alt-speed-time-end"?: number;
  "alt-speed-time-day"?: number;
  "alt-speed-up"?: number;
  "blocklist-url"?: string;
  "blocklist-enabled"?: boolean;
  "blocklist-size"?: number;
  "cache-size-mb"?: number;
  "config-dir"?: string;
  "default-trackers"?: string;
  "dht-enabled"?: boolean;
  "download-dir"?: string;
  "download-dir-free-space"?: number;
  "download-queue-size"?: number;
  "download-queue-enabled"?: boolean;
  encryption?: string;
  "idle-seeding-limit"?: number;
  "idle-seeding-limit-enabled"?: boolean;
  "incomplete-dir"?: string;
  "incomplete-dir-enabled"?: boolean;
  "lpd-enabled"?: boolean;
  "peer-limit-global"?: number;
  "peer-limit-per-torrent"?: number;
  "pex-enabled"?: boolean;
  "peer-port"?: number;
  "peer-port-random-on-start"?: boolean;
  "port-forwarding-enabled"?: boolean;
  "queue-stalled-enabled"?: boolean;
  "queue-stalled-minutes"?: number;
  "rename-partial-files"?: boolean;
  reqq?: number;
  "rpc-version"?: number;
  "rpc-version-minimum"?: number;
  "rpc-version-semver"?: string;
  "script-torrent-added-enabled"?: boolean;
  "script-torrent-added-filename"?: string;
  "script-torrent-done-filename"?: string;
  "script-torrent-done-enabled"?: boolean;
  "script-torrent-done-seeding-enabled"?: boolean;
  "script-torrent-done-seeding-filename"?: string;
  seedRatioLimit?: number;
  seedRatioLimited?: boolean;
  "seed-queue-size"?: number;
  "seed-queue-enabled"?: boolean;
  "sequential-download"?: boolean;
  "session-id"?: string;
  "speed-limit-down"?: number;
  "speed-limit-down-enabled"?: boolean;
  "speed-limit-up"?: number;
  "speed-limit-up-enabled"?: boolean;
  "start-added-torrents"?: boolean;
  "trash-original-torrent-files"?: boolean;
  units?: Units;
  "utp-enabled"?: boolean;
  version?: string;
};

export type SessionGetField = keyof Response;

type SelectedSessionFields<F extends readonly SessionGetField[]> = {
  [K in F[number]]-?: NonNullable<Response[K]>;
};

type IsTuple<T extends readonly unknown[]> = number extends T["length"] ? false : true;

// Only narrow when TypeScript can infer a concrete field subset.
// Widened arrays should keep the broad optional response shape.
export type SessionGetForFields<F extends readonly SessionGetField[]> = IsTuple<F> extends true
  ? SelectedSessionFields<F>
  : Response;

export type ResponseFor<F extends readonly SessionGetField[]> = SessionGetForFields<F>;

export type Request<F extends readonly SessionGetField[] = readonly SessionGetField[]> = {
  fields?: F;
};
