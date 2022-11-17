import * as React from "react";
import {
  Text as _Text,
  TextProps as _TextProps,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

export type TextProps = {
  color?: string;
} & _TextProps;

export default React.memo(function Text({ color, style, ...props }: TextProps) {
  const def = useThemeColor("text");

  return (
    <_Text style={[styles.text, { color: color ?? def }, style]} {...props} />
  );
});

const styles = StyleSheet.create({
  text: {
    fontFamily: "RobotoMono-Regular",
  },
});
