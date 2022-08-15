import * as React from "react";

export type Formatter = {
  formatSpeed: (speed: number) => string;
  formatSize: (size: number) => string;
  formatETA: (eta: number) => string;
  formatStatus: (status: 0 | 1 | 2 | 3 | 4 | 5 | 6) => string;
};

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

const formatSpeed: Formatter["formatSpeed"] = formatBytes([
  "kB/s",
  "MB/s",
  "GB/s",
  "TB/s",
]);
const formatSize: Formatter["formatSize"] = formatBytes([
  "kB",
  "MB",
  "GB",
  "TB",
]);

const formatETA: Formatter["formatETA"] = (eta: number): string => {
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

const formatStatus: Formatter["formatStatus"] = (
  status: 0 | 1 | 2 | 3 | 4 | 5 | 6
): string => {
  switch (status) {
    case 0:
      return "stopped";
    case 1:
      return "queued to verify local data";
    case 2:
      return "verifying local data";
    case 3:
      return "queued to download";
    case 4:
      return "downloading";
    case 5:
      return "queued to seed";
    case 6:
      return "seeding";
  }
};

export default function useFormatter(): Formatter {
  return React.useMemo(
    () => ({ formatSpeed, formatSize, formatETA, formatStatus }),
    []
  );
}
