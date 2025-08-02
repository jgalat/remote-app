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
import { Feather } from "@expo/vector-icons";

import { useTheme } from "~/hooks/use-theme-color";

export type TextInputProps = {
  containerStyle?: StyleProp<ViewStyle>;
  icon?: React.ComponentProps<typeof Feather>["name"];
} & _TextInputProps;

export default React.memo(function TextInput({
  style,
  editable = true,
  containerStyle,
  icon,
  ...props
}: TextInputProps) {
  const { background, text, lightGray, gray } = useTheme();

  return (
    <View
      pointerEvents={editable ? undefined : "none"}
      style={[styles.container, containerStyle]}
    >
      <_TextInput
        autoCapitalize="none"
        style={[
          styles.input,
          {
            backgroundColor: background,
            color: editable ? text : lightGray,
            borderColor: editable ? text : lightGray,
          },
          icon ? { paddingLeft: 40 } : {},
          style,
        ]}
        placeholderTextColor={lightGray}
        {...props}
      />
      {icon ? (
        <Feather color={gray} size={16} name={icon} style={styles.icon} />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    flex: 1,
    fontFamily: "RobotoMono-Regular",
    borderWidth: 2,
    padding: 8,
    height: 48,
    borderRadius: 8,
  },
  icon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
});
