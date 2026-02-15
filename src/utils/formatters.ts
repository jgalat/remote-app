import { TorrentStatus } from "@remote-app/transmission-client";
import i18n from "~/i18n";

function formatBytes(units: string[]): (bytes: number) => string {
  return (bytes: number): string => {
    const step = 1024;
    for (let i = 0; i < units.length; i++) {
      if (bytes < Math.pow(step, i + 2)) {
        return `${(bytes / Math.pow(step, i + 1)).toFixed(2)} ${units[i]}`;
      }
    }
    return i18n.t("infinite");
  };
}

export const formatSpeed = formatBytes(["kB/s", "MB/s", "GB/s", "TB/s", "PB/s"]);
export const formatSize = formatBytes(["kB", "MB", "GB", "TB", "PB"]);

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
      return "status_stopped";
    case TorrentStatus.QUEUED_TO_VERIFY_LOCAL_DATA:
      return "status_queued_to_verify";
    case TorrentStatus.VERIFYING_LOCAL_DATA:
      return "status_verifying";
    case TorrentStatus.QUEUED_TO_DOWNLOAD:
      return "status_queued_to_download";
    case TorrentStatus.DOWNLOADING:
      return "status_downloading";
    case TorrentStatus.QUEUED_TO_SEED:
      return "status_queued_to_seed";
    case TorrentStatus.SEEDING:
      return "status_seeding";
  }
};
