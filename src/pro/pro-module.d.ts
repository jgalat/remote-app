declare module "@remote-app/pro" {
  import type { ProModule, ProContextValue } from "~/pro/types";
  import type { ComponentType, PropsWithChildren } from "react";

  export function createProModule(): ProModule;
  export const ProProvider: ComponentType<PropsWithChildren>;
  export function usePro(): ProContextValue;
  export const ProContext: React.Context<ProContextValue | null>;

  export const PaywallScreen: ComponentType;
  export const SearchScreen: ComponentType;
  export const SearchConfigScreen: ComponentType;
  export const ProSettingsScreen: ComponentType;

  export function getDeviceId(): string;
  export function updateDeviceId(): string;
}
