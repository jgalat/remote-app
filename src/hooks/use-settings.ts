import { useColorScheme as _useColorScheme } from "react-native";

import { SettingsContext } from "~/contexts/settings";
import { Settings, getActiveServer } from "~/store/settings";
import useNonNullContext from "./use-non-null-context";

export default function useSettings() {
  return useNonNullContext(SettingsContext);
}

export function useColorScheme(): "light" | "dark" {
  const {
    settings: { colorScheme },
  } = useSettings();
  const systemColorScheme = _useColorScheme();
  if (colorScheme === "system") {
    if (!systemColorScheme) {
      return "light";
    }
    return systemColorScheme;
  }
  return colorScheme;
}

export function useServer() {
  const { settings } = useSettings();
  return getActiveServer(settings);
}

export function useServers() {
  return useSettings().settings.servers;
}

export function useActiveServerId() {
  return useSettings().settings.activeServerId;
}

export function useListing(): Settings["listing"] {
  return useSettings().settings.listing;
}

export function useAuthentication(): Settings["authentication"] {
  return useSettings().settings.authentication;
}
