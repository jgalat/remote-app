import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";
import Text from "./text";

export type ButtonProps = TouchableOpacity["props"] & {
  title: string;
};

export default function Button(props: ButtonProps) {
  const { style, title, ...otherProps } = props;
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.text }, style]}
      {...otherProps}
    >
      <Text style={[styles.buttonText, { color: theme.background }]}>
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
