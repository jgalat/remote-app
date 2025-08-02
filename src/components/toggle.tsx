import * as React from "react";
import { StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Text from "./text";
import View from "./view";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type ToggleProps = {
  value: boolean;
  label?: string;
  description?: string;
  onPress?: (checked: boolean) => void;
  iconStyle?: React.ComponentProps<typeof FontAwesome>["style"];
} & Omit<PressableProps, "onPress">;

export default React.memo(function Toggle({
  value = false,
  label,
  description,
  onPress,
  style,
  iconStyle,
  disabled,
}: ToggleProps) {
  const { text, gray, tint, yellow } = useTheme();

  return (
    <Pressable
      onPress={() => (disabled ? null : onPress?.(!value))}
      style={[styles.toggle, style]}
      disabled={disabled}
    >
      <View>
        {label && (
          <Text
            style={[
              label && description ? styles.composed : styles.label,
              { color: disabled ? gray : text },
            ]}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text style={[styles.label, { color: gray }]}>{description}</Text>
        )}
      </View>
      <FontAwesome
        style={iconStyle}
        name={disabled ? "warning" : value ? "toggle-on" : "toggle-off"}
        color={disabled ? yellow : value ? tint : text}
        size={disabled ? 24 : 32}
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
  label: {
    fontSize: 14,
  },
  composed: {
    fontSize: 16,
    marginBottom: 4,
    textTransform: "uppercase",
  },
});
