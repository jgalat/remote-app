import * as React from "react";
import { View as _View, ViewProps as _ViewProps } from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type ViewProps = _ViewProps;

export default React.memo(function View({ style, ...props }: ViewProps) {
  const backgroundColor = useThemeColor("background");

  return <_View style={[{ backgroundColor }, style]} {...props} />;
});
