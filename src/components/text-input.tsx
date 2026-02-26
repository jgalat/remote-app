import * as React from "react";
import {
  View,
  TextInput as _TextInput,
  TextInputProps as _TextInputProps,
  ViewStyle,
  StyleSheet,
  StyleProp,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "~/hooks/use-theme-color";

export type TextInputProps = {
  containerStyle?: StyleProp<ViewStyle>;
  icon?: React.ComponentProps<typeof Feather>["name"];
  variant?: "default" | "settings";
} & _TextInputProps;

export default React.forwardRef<_TextInput, TextInputProps>(
  function TextInput(
    { style, editable = true, containerStyle, icon, variant = "default", ...props },
    ref
  ) {
    const { background, text, lightGray, gray } = useTheme();

    const settings = variant === "settings";
    const borderColor = editable
      ? settings
        ? lightGray
        : text
      : lightGray;

    return (
      <View
        pointerEvents={editable ? undefined : "none"}
        style={[styles.container, containerStyle]}
      >
        <_TextInput
          ref={ref}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          style={[
            settings ? styles.settingsInput : styles.input,
            {
              backgroundColor: background,
              color: editable ? text : lightGray,
              borderColor,
            },
            icon ? { paddingLeft: settings ? 36 : 40 } : {},
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
  }
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  input: {
    fontFamily: "RobotoMono-Regular",
    borderWidth: 2,
    padding: 8,
    height: 48,
    borderRadius: 8,
  },
  settingsInput: {
    fontFamily: "RobotoMono-Regular",
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    fontSize: 14,
  },
  icon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -8 }],
  },
});
