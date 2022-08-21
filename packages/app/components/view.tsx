import * as React from "react";
import { View as _View } from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type ViewProps = _View["props"];

export default function View({style, ...props}: ViewProps) {
  const backgroundColor = useThemeColor("background");

  return <_View style={[{ backgroundColor }, style]} {...props} />;
}
