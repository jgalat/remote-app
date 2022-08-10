import * as React from "react";
import { Text as _Text, StyleSheet } from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type TextProps = _Text["props"];

export default function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  const color = useThemeColor("text");

  return <_Text style={[styles.text, { color }, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: "roboto-mono",
  },
});
