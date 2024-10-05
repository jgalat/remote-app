import * as React from "react";
import { StatusBar as _StatusBar } from "expo-status-bar";

import { useColorScheme } from "../hooks/use-settings";

export default React.memo(function StatusBar() {
  const colorScheme = useColorScheme();
  return <_StatusBar style={colorScheme === "dark" ? "light" : "dark"} />;
});
