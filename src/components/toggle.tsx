import * as React from "react";
import { StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Text from "./text";
import View from "./view";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";

export type ToggleProps = {
  value: boolean;
  label?: string;
  description?: string;
  onPress?: (checked: boolean) => void;
  iconStyle?: React.ComponentProps<typeof FontAwesome>["style"];
  variant?: "default" | "settings";
} & Omit<PressableProps, "onPress">;

export default React.memo(function Toggle({
  value = false,
  label,
  description,
  onPress,
  style,
  iconStyle,
  disabled,
  variant = "default",
}: ToggleProps) {
  const { text, gray, tint, yellow } = useTheme();
  const settings = variant === "settings";
  const hasCopy = Boolean(label || description);

  return (
    <Pressable
      onPress={() => (disabled ? null : onPress?.(!value))}
      style={[styles.toggle, !hasCopy && styles.toggleIconOnly, style]}
      disabled={disabled}
    >
      {hasCopy ? (
        <View>
          {label && (
            <Text
              style={[
                label && description
                  ? settings
                    ? styles.settingsComposed
                    : styles.composed
                  : settings
                    ? styles.settingsLabel
                    : styles.label,
                { color: disabled ? gray : text },
              ]}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              style={[
                settings ? styles.settingsDescription : styles.label,
                { color: gray },
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      ) : null}
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
  toggleIconOnly: {
    justifyContent: "center",
    minWidth: 36,
  },
  label: {
    fontSize: 14,
  },
  composed: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingsLabel: {
    fontSize: 13,
    fontFamily: "RobotoMono-Medium",
  },
  settingsComposed: {
    fontSize: 13,
    fontFamily: "RobotoMono-Medium",
    marginBottom: 2,
  },
  settingsDescription: {
    fontSize: 12,
  },
});
