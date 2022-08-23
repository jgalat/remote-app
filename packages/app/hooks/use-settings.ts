import * as React from "react";
import {
  useColorScheme as _useColorScheme,
  ColorSchemeName,
} from "react-native";

import { SettingsContext } from "../contexts/settings";
import { Server } from "../store/settings";

export default function useSettings() {
  return React.useContext(SettingsContext);
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

export function useServer(): Server | undefined {
  return useSettings().settings.server;
}
