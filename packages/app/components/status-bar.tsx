import * as React from "react";
import { StatusBar } from "expo-status-bar";

import { useColorScheme } from "../hooks/use-settings";

export default function () {
  const colorScheme = useColorScheme();
  return <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />;
}
