import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Pressable from "./pressable";

export type ActionIconProps = {
  onPress: React.ComponentProps<typeof Pressable>["onPress"];
  name: React.ComponentProps<typeof Feather>["name"];
  color: React.ComponentProps<typeof Feather>["color"];
  size: React.ComponentProps<typeof Feather>["size"];
  style?: React.ComponentProps<typeof Feather>["style"];
};

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
