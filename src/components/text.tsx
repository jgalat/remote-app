import * as React from "react";
import {
  Text as _Text,
  TextProps as _TextProps,
  StyleSheet,
} from "react-native";

import useThemeColor from "~/hooks/use-theme-color";
import { useAppFontFamily } from "~/contexts/font";

export type TextProps = {
  color?: string;
} & _TextProps;

export default React.memo(function Text({ color, style, ...props }: TextProps) {
  const def = useThemeColor("text");
  const flattenedStyle = StyleSheet.flatten(style);
  const fontFamily = useAppFontFamily(
    flattenedStyle?.fontFamily?.includes("Medium") ? "medium" : "regular",
  );

  return (
    <_Text
      style={[styles.text, { color: color ?? def }, style, { fontFamily }]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  text: {
    fontFamily: "RobotoMono-Regular",
  },
});
