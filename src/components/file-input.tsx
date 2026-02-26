import * as React from "react";
import { StyleSheet, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";

export type FileInputProps = {
  title: string;
  titleStyle?: TextStyle;
  variant?: "default" | "settings";
} & PressableProps;

export default React.memo(function FileInput({
  style,
  title,
  disabled,
  onPress,
  titleStyle,
  variant = "default",
  ...props
}: FileInputProps) {
  const { text, lightGray, background, gray } = useTheme();
  const settings = variant === "settings";

  return (
    <Pressable
      style={[
        settings ? styles.settingsButton : styles.button,
        {
          borderWidth: settings ? 1 : 2,
          backgroundColor: background,
          borderColor: disabled ? lightGray : settings ? lightGray : text,
        },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      <Feather color={gray} size={16} name="share" />
      <Text
        color={gray}
        style={[
          styles.buttonText,
          settings && styles.settingsButtonText,
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
  },
  buttonText: {
    flex: 1,
    textTransform: "lowercase",
    paddingLeft: 8,
  },
  settingsButtonText: {
    textTransform: "none",
    fontSize: 14,
  },
});
