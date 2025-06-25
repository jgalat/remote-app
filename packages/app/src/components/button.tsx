import * as React from "react";
import { StyleSheet } from "react-native";

import Text from "./text";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type ButtonProps = {
  title: string;
} & PressableProps;

export default React.memo(function Button({
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
        { backgroundColor: disabled ? gray : text },
        style,
      ]}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      {...props}
    >
      <Text color={disabled ? lightGray : background} style={styles.buttonText}>
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
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: "RobotoMono-Medium",
    textTransform: "lowercase",
    fontSize: 16,
  },
});
