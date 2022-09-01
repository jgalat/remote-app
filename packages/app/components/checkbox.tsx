import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import { useTheme } from "../hooks/use-theme-color";

export type CheckboxProps = {
  value: boolean;
  label?: string;
  onPress?: (checked: boolean) => void;
};

export default function Checkbox({
  value = false,
  label,
  onPress,
}: CheckboxProps) {
  const { text, tint } = useTheme();

  return React.useMemo(
    () => (
      <Pressable
        onPress={() => onPress?.(!value)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <Feather
          name={value ? "check-square" : "square"}
          color={value ? tint : text}
          size={24}
        />
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </Pressable>
    ),
    [value, label, onPress, text, tint]
  );
}

const styles = StyleSheet.create({
  label: {
    marginLeft: 8,
  },
});
