import * as React from "react";
import {
  ActivityIndicator as _ActivityIndicator,
  ActivityIndicatorProps as _ActivityIndicatorProps,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type ActivityIndicatorProps = _ActivityIndicatorProps;

export default React.memo(function ActivityIndicator(
  props: ActivityIndicatorProps
) {
  const color = useThemeColor("text");

  return <_ActivityIndicator color={color} size="large" {...props} />;
});
