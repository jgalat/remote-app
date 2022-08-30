import * as React from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";
import View from "./view";
import Text from "./text";

export type BadgeProps = { label: string | number } & React.ComponentProps<
  typeof View
>;

export default function Badge({ label, style, ...props }: BadgeProps) {
  const { text, background } = useTheme();

  return React.useMemo(
    () => (
      <View style={[styles.badge, { backgroundColor: text }]} {...props}>
        <Text style={styles.text} color={background}>{label}</Text>
      </View>
    ),
    [label, style, text, background]
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    borderRadius: 24,
  },
  text: {
    fontSize: 14,
  }
});
