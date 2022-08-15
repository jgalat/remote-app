import * as React from "react";
import { StyleSheet } from "react-native";

import View from "./view";

export type ActionListProps = {
  spacing?: number;
  children: JSX.Element | JSX.Element[];
};

export default function ActionList({
  spacing = 16,
  children,
}: ActionListProps) {
  return (
    <View style={styles.list}>
      {React.Children.map(children, (c) => (
        <View style={{ marginLeft: spacing }}>{c}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    alignItems: "center",
  },
});
