import { TorrentStatus } from "@remote-app/transmission-client";

function formatBytes(units: string[]): (bytes: number) => string {
  return (bytes: number): string => {
    const step = 1024;
    for (let i = 0; i < units.length; i++) {
      if (bytes < Math.pow(step, i + 2)) {
        return `${(bytes / Math.pow(step, i + 1)).toFixed(2)} ${units[i]}`;
      }
    }
    return `infinite`;
  };
}

export const formatSpeed = formatBytes(["kB/s", "MB/s", "GB/s", "TB/s"]);
export const formatSize = formatBytes(["kB", "MB", "GB", "TB"]);

export const formatETA = (eta: number): string => {
  if (eta < 0) {
    return "";
  }

  const days = Math.floor(eta / 86400);
  const hours = Math.floor(eta / 3600) % 24;
  const minutes = Math.floor(eta / 60) % 60;
  const seconds = eta % 60;

  if (days > 7) {
    return `${days}d`;
  } else if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

export const formatStatus = (status: TorrentStatus): string => {
  switch (status) {
    case TorrentStatus.STOPPED:
      return "stopped";
    case TorrentStatus.QUEUED_TO_VERIFY_LOCAL_DATA:
      return "queued to verify local data";
    case TorrentStatus.VERIFYING_LOCAL_DATA:
      return "verifying local data";
    case TorrentStatus.QUEUED_TO_DOWNLOAD:
      return "queued to download";
    case TorrentStatus.DOWNLOADING:
      return "downloading";
    case TorrentStatus.QUEUED_TO_SEED:
      return "queued to seed";
    case TorrentStatus.SEEDING:
      return "seeding";
  }
};
