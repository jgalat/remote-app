import * as React from "react";
import {
  View as _View,
  ScrollView as _ScrollView,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type ScreenProps = _View["props"] & {
  scroll?: boolean;
};

export default function Screen(props: ScreenProps) {
  const { style, scroll = false, ...otherProps } = props;
  const backgroundColor = useThemeColor("background");

  const Component = scroll ? _ScrollView : _View;

  return (
    <Component
      style={[styles.screen, { backgroundColor }, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
});
