import * as React from "react";
import { StyleSheet } from "react-native";

import View, { ViewProps } from "./view";

export type ActionListProps = {
  spacing?: number;
} & ViewProps;

export default function ActionList({
  spacing = 12,
  children,
}: ActionListProps) {
  return (
    <View style={styles.list}>
      {React.Children.map(children, (c) =>
        c !== null && c !== undefined ? (
          <View style={{ marginLeft: spacing }}>{c}</View>
        ) : null
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    alignItems: "center",
  },
});
