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

export default React.forwardRef<
  React.ComponentRef<typeof _Pressable>,
  PressableProps
>(function Pressable({ style, disabled, ...props }, ref) {
  return (
    <_Pressable
      ref={ref}
      style={({ pressed }) => [
        style,
        {
          opacity: disabled ? 1 : pressed ? 0.5 : 1,
        },
      ]}
      hitSlop={12}
      pressRetentionOffset={12}
      {...props}
    />
  );
});
