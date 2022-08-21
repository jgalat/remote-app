import * as React from "react";
import {
  View as _View,
  ScrollView as _ScrollView,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type ScreenProps = {
  scroll?: boolean;
} & _View["props"];

export default function Screen({
  style,
  scroll = false,
  ...props
}: ScreenProps) {
  const backgroundColor = useThemeColor("background");
  const Component = scroll ? _ScrollView : _View;

  return (
    <Component style={[styles.screen, { backgroundColor }, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
});
