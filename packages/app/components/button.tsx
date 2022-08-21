import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";
import Text from "./text";

export type ButtonProps = {
  title: string;
} & TouchableOpacity["props"];

export default function Button({ style, title, ...props }: ButtonProps) {
  const { text, background } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: text }, style]}
      {...props}
    >
      <Text color={background} style={styles.buttonText}>
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
    textTransform: "uppercase",
    fontWeight: "500",
    fontSize: 16,
  },
});
