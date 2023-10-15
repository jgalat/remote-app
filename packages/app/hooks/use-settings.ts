import {
  useColorScheme as _useColorScheme,
  ColorSchemeName,
} from "react-native";

import { SettingsContext } from "../contexts/settings";
import { Settings } from "../store/settings";
import useNonNullContext from "./use-non-null-context";

export default function useSettings() {
  return useNonNullContext(SettingsContext)
}

export function useColorScheme(): "light" | "dark" {
  const {
    settings: { colorScheme },
  } = useSettings();
  const systemColorScheme = _useColorScheme() as NonNullable<ColorSchemeName>;
  if (colorScheme == "system") {
    return systemColorScheme;
  }
  return colorScheme;
}

export function useServer(): Settings["server"] {
  return useSettings().settings.server;
}

export function useListing(): Settings["listing"] {
  return useSettings().settings.listing;
}

export function useAuthentication(): Settings["authentication"] {
  return useSettings().settings.authentication;
}
