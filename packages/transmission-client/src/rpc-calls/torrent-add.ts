import type { Response as TorrentAddResponse } from "./torrent-get";

type optionals = {
  cookies?: string;
  "download-dir"?: string;
  paused?: boolean;
  "peer-limit"?: number;
  bandwidthPriority?: number;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  "priority-high"?: number[];
  "priority-low"?: number[];
  "priority-normal"?: number[];
};

export type Request = ({ filename: string } | { metainfo: string }) & optionals;

export type Response = {
  torrents: Pick<
    TorrentAddResponse["torrents"][number],
    "id" | "name" | "hashString"
  >[];
};
