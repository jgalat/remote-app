import * as React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { useTheme } from "../hooks/use-theme-color";

export type ProgressBarProps = {
  progress: number;
  color: string;
} & Pick<ViewProps, "style">;

export default React.memo(function ProgressBar({
  progress,
  color,
  style,
}: ProgressBarProps) {
  const { lightGray } = useTheme();
  return (
    <View style={[style, styles.root]}>
      <View style={[styles.background, { backgroundColor: lightGray }]} />
      <View
        style={[
          styles.foreground,
          { width: `${progress}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    height: 8,
    position: "relative",
  },
  foreground: {
    height: 8,
    position: "absolute",
  },
  background: {
    height: 8,
    width: "100%",
    position: "absolute",
  },
});
