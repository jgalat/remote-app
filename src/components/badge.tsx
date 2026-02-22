import * as React from "react";
import { StyleSheet } from "react-native";

import { useTheme } from "~/hooks/use-theme-color";
import View, { ViewProps } from "./view";
import Text from "./text";

export type BadgeProps = { label: string | number } & ViewProps;

export default React.memo(function Badge({
  label,
  style,
  ...props
}: BadgeProps) {
  const { text, background } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: text }, style]} {...props}>
      <Text style={styles.text} color={background}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    height: 24,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
  },
  text: {
    fontSize: 14,
  },
});
