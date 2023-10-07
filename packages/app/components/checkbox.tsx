import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Pressable, { PressableProps } from "./pressable";
import Text from "./text";
import { useTheme } from "../hooks/use-theme-color";

export type CheckboxProps = {
  value: boolean;
  label?: string;
  onPress?: (checked: boolean) => void;
  iconStyle?: React.ComponentProps<typeof Feather>["style"];
} & Omit<PressableProps, "onPress">;

export default React.memo(function Checkbox({
  value = false,
  label,
  onPress,
  style,
  iconStyle,
}: CheckboxProps) {
  const { text, tint } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(!value)}
      style={[styles.checkbox, style]}
    >
      <Feather
        style={[styles.icon, iconStyle]}
        name={value ? "check-square" : "square"}
        color={value ? tint : text}
        size={24}
      />
      {label ? <Text>{label}</Text> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    paddingRight: 12,
    paddingLeft: 12,
  },
});
