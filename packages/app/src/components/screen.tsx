import * as React from "react";
import {
  View as _View,
  ViewProps,
  ScrollView as _ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

type Variant = "view" | "scroll";

export type ScreenProps = {
  variant?: Variant;
} & ViewProps &
  ScrollViewProps;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function view(variant: Variant): any {
  switch (variant) {
    case "view":
      return _View;
    case "scroll":
      return _ScrollView;
  }
}

export default React.memo(function Screen({
  style,
  variant = "view",
  ...props
}: ScreenProps) {
  const backgroundColor = useThemeColor("background");
  const Component = view(variant);

  return (
    <Component style={[styles.screen, { backgroundColor }, style]} {...props} />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
  },
});
