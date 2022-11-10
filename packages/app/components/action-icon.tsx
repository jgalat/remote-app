import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Pressable, { PressableProps } from "./pressable";

export type ActionIconProps = React.ComponentProps<typeof Feather> &
  Omit<PressableProps, "style">;

export default React.memo(function ActionIcon({
  onPress,
  name,
  color,
  size,
  style,
}: ActionIconProps) {
  return (
    <Pressable onPress={onPress}>
      <Feather
        style={[styles.icon, style]}
        name={name}
        size={size}
        color={color}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  icon: {
    padding: 8,
  },
});
