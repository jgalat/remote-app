import type { Response as TorrentGetResponse } from "./torrent-get";

type optionals = {
  cookies?: string;
  "download-dir"?: string;
  labels?: string[];
  paused?: boolean;
  "peer-limit"?: number;
  bandwidthPriority?: number;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  "priority-high"?: number[];
  "priority-low"?: number[];
  "priority-normal"?: number[];
  "sequential-download"?: boolean;
};

export type Request = ({ filename: string } | { metainfo: string }) & optionals;

export type Response =
  | {
      "torrent-added": Pick<
        TorrentGetResponse["torrents"][number],
        "id" | "name" | "hashString"
      >[];
    }
  | {
      "torrent-duplicate": Pick<
        TorrentGetResponse["torrents"][number],
        "id" | "name" | "hashString"
      >[];
    };
