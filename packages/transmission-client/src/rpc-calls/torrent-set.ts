import type { Identifiers } from "./utils";

export type Request = Identifiers & {
  bandwidthPriority?: number;
  downloadLimit?: number;
  downloadLimited?: boolean;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  honorsSessionLimits?: boolean;
  labels?: string[];
  location?: string;
  "peer-limit"?: number;
  "priority-high"?: number[];
  "priority-low"?: number[];
  "priority-normal"?: number[];
  queuePosition?: number;
  seedIdleLimit?: number;
  seedIdleMode?: number;
  seedRatioLimit?: number;
  seedRatioMode?: number;
  trackerAdd?: string[];
  trackerRemove?: number[];
  trackerReplace?: Array<{id: number; announce: string}>;
  trackerList?: string;
  group?: string;
  sequentialDownload?: boolean;
  uploadLimit?: number;
  uploadLimited?: boolean;
};
