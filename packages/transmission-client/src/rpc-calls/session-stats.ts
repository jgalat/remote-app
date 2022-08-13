type CurrentStats = {
  uploadedBytes: number;
  downloadedBytes: number;
  filesAdded: number;
  sessionCount: number;
  secondsActive: number;
};

type CumulativeStats = {
  uploadedBytes: number;
  downloadedBytes: number;
  filesAdded: number;
  sessionCount: number;
  secondsActive: number;
};

export type Response = {
  activeTorrentCount: number;
  downloadSpeed: number;
  pausedTorrentCount: number;
  torrentCount: number;
  uploadSpeed: number;
  "cumulative-stats": CumulativeStats;
  "current-stats": CurrentStats;
};
