import * as React from "react";

import { useSession } from "../hooks/use-transmission";

export type Formatter = {
  formatSpeed: (speed: number) => string;
  formatSize: (size: number) => string;
  formatETA: (eta: number) => string;
  formatStatus: (status: 0 | 1 | 2 | 3 | 4 | 5 | 6) => string;
};

const noop = (_: any) => "";

export default function useFormatter(): Formatter {
  const { data: session, error } = useSession();

  const formatSpeed = React.useCallback<Formatter["formatSpeed"]>(
    (speed: number): string => {
      const tail = "B/s";
      const units = session?.units?.["speed-units"] ?? [];
      const step = session?.units?.["speed-bytes"];
      if (!step) {
        return `${speed} ${tail}`;
      }
      for (let i = 0; i < units.length; i++) {
        if (speed < Math.pow(step, i + 2)) {
          return `${(speed / Math.pow(step, i + 1)).toFixed(2)} ${
            units[i][0]
          }${tail}`;
        }
      }
      return `infinite`;
    },
    [session?.units]
  );

  const formatSize = React.useCallback<Formatter["formatSize"]>(
    (size: number): string => {
      const tail = "B";
      const units = session?.units?.["size-units"] ?? [];
      const step = session?.units?.["size-bytes"];
      if (!step) {
        return `${size} ${tail}`;
      }
      for (let i = 0; i < units.length; i++) {
        if (size < Math.pow(step, i + 2)) {
          return `${(size / Math.pow(step, i + 1)).toFixed(2)} ${
            units[i][0]
          }${tail}`;
        }
      }
      return `infinite`;
    },
    [session?.units]
  );

  const formatETA = React.useCallback<Formatter["formatETA"]>(
    (eta: number): string => {
      if (eta < 0) {
        return "";
      }

      const days = Math.floor(eta / 86400);
      const hours = Math.floor(eta / 3600) % 24;
      const minutes = Math.floor(eta / 60) % 60;
      const seconds = eta % 60;

      if (days > 7) {
        return `>${days}d`;
      } else if (days > 0) {
        return `${days}d ${hours}h`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }

      return `${seconds}s`;
    },
    []
  );

  const formatStatus = React.useCallback<Formatter["formatStatus"]>(
    (status: 0 | 1 | 2 | 3 | 4 | 5 | 6): string => {
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
    },
    []
  );

  if (error || !session) {
    return {
      formatSpeed: noop,
      formatSize: noop,
      formatETA: noop,
      formatStatus: noop,
    };
  }

  return { formatSpeed, formatSize, formatETA, formatStatus };
}
