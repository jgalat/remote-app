import type { Identifiers } from "./utils";

export type Request = Identifiers & {
  bandwidthPriority?: number;
  downloadLimit?: number;
  downloadLimited?: boolean;
  "files-wanted"?: number[];
  "files-unwanted"?: number[];
  honorsSessionLimits?: boolean;
  labels?: any[];
  location?: string;
  peerLimit?: number;
  "priority-high"?: any[];
  "priority-low"?: any[];
  "priority-normal"?: any[];
  queuePosition?: number;
  seedIdleLimit?: number;
  seedIdleMode?: number;
  seedRatioLimit?: number;
  seedRatioMode?: number;
  trackerAdd?: any[];
  trackerRemove?: number[];
  trackerReplace?: any[];
  uploadLimit?: number;
  uploadLimited?: boolean;
};
