import * as React from "react";
import { StyleSheet } from "react-native";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";

export type ButtonProps = {
  title: string;
  variant?: "primary" | "outline";
} & PressableProps;

export default React.memo(function Button({
  style,
  title,
  disabled,
  onPress,
  variant = "primary",
  ...props
}: ButtonProps) {
  const { text, lightGray, background, gray } = useTheme();
  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: disabled
            ? gray
            : variant === "primary"
            ? text
            : background,
        },
        variant === "primary" ? {} : { borderWidth: 2, borderColor: text },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      <Text
        color={disabled ? lightGray : variant === "primary" ? background : text}
        style={styles.buttonText}
      >
        {title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
    padding: 8,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "RobotoMono-Medium",
    textTransform: "lowercase",
    fontSize: 16,
  },
});
