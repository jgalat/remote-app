import * as React from "react";
import {
  View,
  ViewProps,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export const Screen = React.forwardRef<
  React.ComponentRef<typeof View>,
  ViewProps
>(function Screen(props, ref) {
  const backgroundColor = useThemeColor("background");
  return (
    <View
      ref={ref}
      style={[styles.screen, { backgroundColor }, props.style]}
      {...props}
    />
  );
});

export const ScrollScreen = React.forwardRef<
  React.ComponentRef<typeof ScrollView>,
  ScrollViewProps
>(function ScrollScreen(props, ref) {
  const backgroundColor = useThemeColor("background");
  return (
    <ScrollView
      ref={ref}
      style={[styles.screen, { backgroundColor }, props.style]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
});
