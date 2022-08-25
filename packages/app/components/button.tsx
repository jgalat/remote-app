import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";
import Text from "./text";

export type ButtonProps = {
  title: string;
} & TouchableOpacity["props"];

export default function Button({
  style,
  title,
  disabled,
  ...props
}: ButtonProps) {
  const { text, gray, background } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: text }, style]}
      activeOpacity={disabled ? 1 : undefined}
      {...props}
    >
      <Text color={disabled ? gray : background} style={styles.buttonText}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    padding: 8,
    height: 48,
    marginBottom: 24,
  },
  buttonText: {
    fontFamily: "roboto-mono_medium",
    textTransform: "uppercase",
    fontSize: 16,
  },
});
