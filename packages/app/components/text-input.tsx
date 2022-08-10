import * as React from "react";
import { TextInput as _TextInput, StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";

export type TextInputProps = _TextInput["props"];

export default function TextInput(props: TextInputProps) {
  const { style, ...otherProps } = props;
  const theme = useTheme();

  return (
    <_TextInput
      autoCapitalize="none"
      style={[
        styles.input,
        {
          backgroundColor: theme.background,
          color: theme.text,
          borderColor: theme.text,
        },
        style,
      ]}
      placeholderTextColor={theme.placeholder}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: "roboto-mono",
    borderWidth: 2,
    padding: 8,
    height: 48,
    marginBottom: 24,
  },
});
