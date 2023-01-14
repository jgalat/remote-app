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
} & Omit<PressableProps, "onPress">;

export default React.memo(function Checkbox({
  value = false,
  label,
  onPress,
  style,
}: CheckboxProps) {
  const { text, tint } = useTheme();

  return (
    <Pressable
      onPress={() => onPress?.(!value)}
      style={[styles.checkbox, style]}
    >
      <Feather
        name={value ? "check-square" : "square"}
        color={value ? tint : text}
        size={24}
      />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    marginLeft: 8,
  },
});
