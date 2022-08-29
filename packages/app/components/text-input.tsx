import * as React from "react";
import { TextInput as _TextInput, StyleSheet } from "react-native";

import { useTheme } from "../hooks/use-theme-color";

export type TextInputProps = _TextInput["props"];

export default function TextInput({ style, ...props }: TextInputProps) {
  const { background, text, gray } = useTheme();

  return (
    <_TextInput
      autoCapitalize="none"
      style={[
        styles.input,
        {
          backgroundColor: background,
          color: text,
          borderColor: text,
        },
        style,
      ]}
      placeholderTextColor={gray}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: "RobotoMono-Regular",
    borderWidth: 2,
    padding: 8,
    height: 48,
    marginBottom: 24,
  },
});
