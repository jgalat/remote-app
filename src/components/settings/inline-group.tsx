import * as React from "react";
import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

type InlineGroupProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function InlineGroup({
  children,
  style,
}: InlineGroupProps) {
  return <View style={[styles.group, style]}>{children}</View>;
});

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
