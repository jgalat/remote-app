import * as React from "react";
import { StyleSheet } from "react-native";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type ButtonProps = {
  title: string;
} & PressableProps;

export default function Button({
  style,
  title,
  disabled,
  ...props
}: ButtonProps) {
  const { text, gray, background } = useTheme();

  return (
    <Pressable
      style={[styles.button, { backgroundColor: text }, style]}
      disabled={disabled}
      {...props}
    >
      <Text color={disabled ? gray : background} style={styles.buttonText}>
        {title}
      </Text>
    </Pressable>
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
    fontFamily: "RobotoMono-Medium",
    textTransform: "uppercase",
    fontSize: 16,
  },
});
