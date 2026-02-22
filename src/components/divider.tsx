import * as React from "react";
import { StyleSheet, ViewProps } from "react-native";

import View from "./view";
import Text from "./text";
import { useTheme } from "~/hooks/use-theme-color";

export type DividerProps = {
  title?: string;
} & ViewProps;

export default React.memo(function Divider({ title, style }: DividerProps) {
  const { lightGray } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.line, { backgroundColor: lightGray }]} />
      <Text style={{ color: lightGray }}>{title}</Text>
      <View style={[styles.line, { backgroundColor: lightGray }]} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 2,
  },
});
