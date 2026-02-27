export { ProProvider, usePro, ProContext } from "./context";
export { createProModule } from "./module";
export {
  PaywallScreen,
  SearchScreen,
  SearchConfigScreen,
  ProSettingsScreen,
  BackupSettingsScreen,
  AppIdScreen,
} from "./screens";

export function getAppId(): string {
  return "";
}

export function generateAppId(): string {
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function setAppId(_id: string): void {}
