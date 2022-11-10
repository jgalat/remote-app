import * as React from "react";
import {
  View as _View,
  ViewProps,
  ScrollView as _ScrollView,
  ScrollViewProps,
  KeyboardAvoidingView as _KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  StyleSheet,
} from "react-native";

import useThemeColor from "../hooks/use-theme-color";

type Variant = "view" | "scroll" | "keyboardavoiding";

export type ScreenProps = {
  variant?: Variant;
} & ViewProps &
  ScrollViewProps &
  KeyboardAvoidingViewProps;

function view(variant: Variant): any {
  switch (variant) {
    case "view":
      return _View;
    case "scroll":
      return _ScrollView;
    case "keyboardavoiding":
      return _KeyboardAvoidingView;
  }
}

export default function Screen({
  style,
  variant = "view",
  ...props
}: ScreenProps) {
  const backgroundColor = useThemeColor("background");
  const Component = view(variant);

  return (
    <Component style={[styles.screen, { backgroundColor }, style]} {...props} />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
});
