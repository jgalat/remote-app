import * as React from "react";
import { StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type ToggleProps = {
  value: boolean;
  label: string;
  onPress?: (checked: boolean) => void;
  iconStyle?: React.ComponentProps<typeof FontAwesome>["style"];
} & Omit<PressableProps, "onPress">;

export default React.memo(function Toggle({
  value = false,
  label,
  onPress,
  style,
  iconStyle,
}: ToggleProps) {
  const { text, tint } = useTheme();

  return (
    <Pressable onPress={() => onPress?.(!value)} style={[styles.toggle, style]}>
      <Text>{label}</Text>
      <FontAwesome
        style={iconStyle}
        name={value ? "toggle-on" : "toggle-off"}
        color={value ? tint : text}
        size={32}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
