import * as React from "react";
import type {
  EngineSettings,
  LocalEngineStatus,
} from "~/pro/types";
import type { TorrentClient } from "~/client/interface";
import { createUnavailableClient } from "~/client/unavailable";
import type { Server } from "~/store/servers";

export const LOCAL_SERVER_ID = "local" as const;

const UNAVAILABLE = "Local service is not available in this build.";

function reject(): never {
  throw new Error(UNAVAILABLE);
}

const unavailableLocalClient = createUnavailableClient(reject);

export function createLocalTorrentClient(server: Server): TorrentClient {
  void server;
  return unavailableLocalClient;
}

export function isLocalEngineAvailable(): boolean {
  return false;
}

export function LocalEngineProvider({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function useLocalEngineStatus(): LocalEngineStatus {
  return {
    available: false,
    state: "stopped",
    stats: null,
    settings: null,
    error: null,
  };
}

type MutationOptions = {
  onSuccess?: () => void;
  onError?: () => void;
  onSettled?: () => void;
};

export function useEnsureLocalServer() {
  return {
    mutate: (_name?: string, options?: MutationOptions) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useRemoveLocalServer() {
  return {
    mutate: (_: undefined, options?: MutationOptions) => {
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useResumeLocalEngine() {
  return {
    mutate: (_: undefined, options?: MutationOptions) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useStopLocalEngine() {
  return {
    mutate: (_: undefined, options?: MutationOptions) => {
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useBatteryOptIgnored() {
  return {
    ignored: true,
    available: false,
    request: async () => {},
  };
}

export function useExportToDownloads() {
  return {
    mutate: (
      _params: { infoHash: string },
      options?: { onSuccess?: () => void; onError?: () => void; onSettled?: () => void },
    ) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useCopyLocalFileToDownloads() {
  return {
    mutate: (
      _params: { infoHash: string; fileIndex: number },
      options?: MutationOptions,
    ) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useOpenLocalFile() {
  return {
    mutate: (
      _params: { infoHash: string; fileIndex: number },
      options?: MutationOptions,
    ) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function useShareLocalFile() {
  return {
    mutate: (
      _params: { infoHash: string; fileIndex: number },
      options?: MutationOptions,
    ) => {
      options?.onError?.();
      options?.onSettled?.();
    },
    isPending: false,
  };
}

export function loadLocalEngineSettings(): EngineSettings {
  return {
    downloadDir: "",
    listenPortStart: 6881,
    listenPortEnd: 6889,
    maxConnections: 200,
    maxUploads: 4,
    maxActiveDownloads: 5,
    maxActiveSeeds: 5,
    dht: true,
    pex: true,
    lsd: true,
    utp: true,
    encryption: "enabled",
    uploadRateLimit: 0,
    downloadRateLimit: 0,
    seedRatioLimit: 0,
  };
}

export function storeLocalEngineSettings(s: EngineSettings): void {
  void s;
}
