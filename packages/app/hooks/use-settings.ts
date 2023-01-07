import * as React from "react";
import {
  useColorScheme as _useColorScheme,
  ColorSchemeName,
} from "react-native";

import { SettingsContext } from "../contexts/settings";
import { Settings } from "../store/settings";

export default function useSettings() {
  const ctx = React.useContext(SettingsContext);
  if (!ctx) {
    throw new Error("Using SettingsContext outside of provider");
  }
  return ctx;
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
