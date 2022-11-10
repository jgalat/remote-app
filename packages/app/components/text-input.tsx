import * as React from "react";
import {
  View,
  TextInput as _TextInput,
  TextInputProps as _TextInputProps,
  TextStyle,
  StyleSheet,
  StyleProp,
} from "react-native";

import { useTheme } from "../hooks/use-theme-color";

export type TextInputProps = {
  containerStyle?: StyleProp<TextStyle>;
} & _TextInputProps;

export default function TextInput({
  style,
  editable = true,
  containerStyle,
  ...props
}: TextInputProps) {
  const { background, text, gray, lightGray } = useTheme();

  return (
    <View pointerEvents={editable ? undefined : "none"} style={containerStyle}>
      <_TextInput
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: background,
            color: editable ? text : lightGray,
            borderColor: editable ? text : lightGray,
          },
          style,
        ]}
        placeholderTextColor={editable ? gray : lightGray}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontFamily: "RobotoMono-Regular",
    borderWidth: 2,
    padding: 8,
    height: 48,
  },
});
