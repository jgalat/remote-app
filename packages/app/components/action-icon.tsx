import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export type ActionIconProps = {
  onPress: React.ComponentProps<typeof Pressable>["onPress"];
  name: React.ComponentProps<typeof Feather>["name"];
  color: React.ComponentProps<typeof Feather>["color"];
  size: React.ComponentProps<typeof Feather>["size"];
  style?: React.ComponentProps<typeof Feather>["style"];
  disabled?: React.ComponentProps<typeof Pressable>["disabled"];
};

export default React.memo(function ActionIcon({
  onPress,
  name,
  color,
  size,
  style,
  disabled = false,
}: ActionIconProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: disabled ? 1 : pressed ? 0.2 : 1,
      })}
      disabled={disabled}
    >
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
