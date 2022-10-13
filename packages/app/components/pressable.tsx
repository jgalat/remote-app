import * as React from "react";
import { Pressable as _Pressable, StyleProp, ViewStyle } from "react-native";

export type PressableProps = {
  style?: StyleProp<ViewStyle>;
} & Omit<React.ComponentProps<typeof _Pressable>, "style">;

export default function Pressable({
  style,
  disabled,
  ...props
}: PressableProps) {
  return (
    <_Pressable
      style={({ pressed }) => [
        style,
        {
          opacity: disabled ? 1 : pressed ? 0.5 : 1,
        },
      ]}
      hitSlop={8}
      pressRetentionOffset={8}
      {...props}
    />
  );
}