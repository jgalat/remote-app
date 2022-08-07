import * as React from "react";
import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export type ActionIconProps = {
  onPress: React.ComponentProps<typeof Pressable>["onPress"];
  name: React.ComponentProps<typeof Feather>["name"];
  color: React.ComponentProps<typeof Feather>["color"];
  size: React.ComponentProps<typeof Feather>["size"];
};

export default function ActionIcon({
  onPress,
  name,
  color,
  size,
}: ActionIconProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Feather name={name} size={size} color={color} />
    </Pressable>
  );
}
