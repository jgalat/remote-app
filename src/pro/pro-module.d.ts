declare module "@remote-app/pro" {
  import type {
    ProModule,
    ProContextValue,
    EngineSettings,
    LocalEngineStatus,
  } from "~/pro/types";
  import type { ComponentType, PropsWithChildren } from "react";
  import type { Server } from "~/store/servers";
  import type { TorrentClient } from "~/client/interface";

  export function createProModule(): ProModule;
  export const ProProvider: ComponentType<PropsWithChildren>;
  export function usePro(): ProContextValue;
  export const ProContext: React.Context<ProContextValue | null>;

  export const PaywallScreen: ComponentType;
  export const SearchScreen: ComponentType;
  export const SearchConfigScreen: ComponentType;
  export const ProSettingsScreen: ComponentType;
  export const BackupSettingsScreen: ComponentType;
  export const AppIdScreen: ComponentType;
  export function getAppId(): string;
  export function generateAppId(): string;
  export function setAppId(id: string): void;

  export const LocalEngineProvider: ComponentType<PropsWithChildren>;
  export function createLocalTorrentClient(server: Server): TorrentClient;
  export function useLocalEngineStatus(): LocalEngineStatus;
  export function isLocalEngineAvailable(): boolean;
  type MutationOptions = {
    onSuccess?: () => void;
    onError?: () => void;
    onSettled?: () => void;
  };
  export function useEnsureLocalServer(): {
    mutate: (name?: string, options?: MutationOptions) => void;
    isPending: boolean;
  };
  export function useRemoveLocalServer(): {
    mutate: (_: undefined, options?: MutationOptions) => void;
    isPending: boolean;
  };
  export function useResumeLocalEngine(): {
    mutate: (_: undefined, options?: MutationOptions) => void;
    isPending: boolean;
  };
  export function useStopLocalEngine(): {
    mutate: (_: undefined, options?: MutationOptions) => void;
    isPending: boolean;
  };
  export function useAllFilesAccess(): {
    granted: boolean;
    available: boolean;
    request: () => Promise<void>;
  };
  export function useBatteryOptIgnored(): {
    ignored: boolean;
    available: boolean;
    request: () => Promise<void>;
  };
  export function pickLocalDirectory(): Promise<string | null>;
  export function loadLocalEngineSettings(): EngineSettings;
  export function storeLocalEngineSettings(s: EngineSettings): void;
  export const LOCAL_SERVER_ID: "local";
}
