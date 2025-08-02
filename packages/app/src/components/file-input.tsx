import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type ButtonProps = {
  title: string;
} & PressableProps;

export default React.memo(function FileInput({
  style,
  title,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const { text, lightGray, background, gray } = useTheme();
  return (
    <Pressable
      style={[
        styles.button,
        {
          borderWidth: 2,
          backgroundColor: background,
          borderColor: disabled ? lightGray : text,
        },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      <Feather color={gray} size={16} name="share" />
      <Text color={gray} style={styles.buttonText}>
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
  buttonText: {
    flex: 1,
    textTransform: "lowercase",
    paddingLeft: 8,
  },
});
