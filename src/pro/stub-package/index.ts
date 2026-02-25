export { ProProvider, usePro, ProContext } from "./context";
export { createProModule } from "./module";
export {
  PaywallScreen,
  SearchScreen,
  SearchConfigScreen,
  ProSettingsScreen,
  BackupSettingsScreen,
} from "./screens";

export function getDeviceId(): string {
  return "";
}

export function updateDeviceId(): string {
  return "";
}
