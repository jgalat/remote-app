import Constants from "expo-constants";

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? "unknown";
}
