import type { Response as TorrentAddResponse } from "./torrent-get";

export type Request = {
  cookies?: string;
  "download-dir": string;
  filename?: string;
  metainfo?: string;
  paused?: boolean;
  "peer-limit"?: number;
  bandwidthPriority?: number;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  "priority-high"?: number[];
  "priority-low"?: number[];
  "priority-normal"?: number[];
};

export type Response = {
  torrents: Pick<
    TorrentAddResponse["torrents"][number],
    "id" | "name" | "hashString"
  >[];
};
