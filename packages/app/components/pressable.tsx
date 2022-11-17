import * as React from "react";
import {
  Pressable as _Pressable,
  PressableProps as _PressableProps,
  StyleProp,
  ViewStyle,
} from "react-native";

export type PressableProps = {
  style?: StyleProp<ViewStyle>;
} & Omit<_PressableProps, "style">;

export default React.memo(function Pressable({
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
});
