import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../hooks/use-theme-color";
import Pressable, { PressableProps } from "./pressable";

export type ActionIconProps = React.ComponentProps<typeof Feather> &
  Omit<PressableProps, "style">;

export default React.memo(function ActionIcon({
  onPress,
  name,
  color,
  size = 24,
  style,
}: ActionIconProps) {
  const { text } = useTheme();
  return (
    <Pressable onPress={onPress}>
      <Feather
        style={[styles.icon, style]}
        name={name}
        size={size}
        color={color ?? text}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  icon: {
    padding: 8,
  },
});
