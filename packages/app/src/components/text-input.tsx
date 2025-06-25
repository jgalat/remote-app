import * as React from "react";
import {
  View,
  TextInput as _TextInput,
  TextInputProps as _TextInputProps,
  ViewStyle,
  StyleSheet,
  StyleProp,
} from "react-native";
import { Control, Path, useController } from "react-hook-form";

import { useTheme } from "../hooks/use-theme-color";

export type TextInputProps = {
  name: Path<any>;
  control: Control<any, any, any>;
  containerStyle?: StyleProp<ViewStyle>;
} & _TextInputProps;

export default React.memo(function TextInput({
  name,
  control,
  style,
  editable = true,
  containerStyle,
  ...props
}: TextInputProps) {
  const { background, text, lightGray, gray } = useTheme();
  const { field } = useController({ name, control });

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
        value={field.value.toString()}
        onChangeText={field.onChange}
        placeholderTextColor={gray}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  input: {
    fontFamily: "RobotoMono-Regular",
    borderWidth: 2,
    padding: 8,
    height: 48,
    borderRadius: 8,
  },
});
