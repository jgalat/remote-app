import * as React from "react";
import { StatusBar as _StatusBar } from "expo-status-bar";

import { useColorScheme } from "../hooks/use-settings";

export default function StatusBar() {
  const colorScheme = useColorScheme();
  return React.useMemo(
    () => <_StatusBar style={colorScheme === "dark" ? "light" : "dark"} />,
    [colorScheme]
  );
}
