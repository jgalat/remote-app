import * as React from "react";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export type ActionIconProps = {
  onPress: React.ComponentProps<typeof Pressable>["onPress"];
  name: React.ComponentProps<typeof Feather>["name"];
  color: React.ComponentProps<typeof Feather>["color"];
  size: React.ComponentProps<typeof Feather>["size"];
  disabled?: React.ComponentProps<typeof Pressable>["disabled"];
};

export default React.memo(function ActionIcon({
  onPress,
  name,
  color,
  size,
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
      <Feather name={name} size={size} color={color} />
    </Pressable>
  );
});
