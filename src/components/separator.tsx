import * as React from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import View from "./view";
import { useTheme } from "~/hooks/use-theme-color";

type SeparatorProps = {
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function Separator({ style }: SeparatorProps) {
  const { lightGray } = useTheme();
  return <View style={[styles.separator, { backgroundColor: lightGray }, style]} />;
});

const styles = StyleSheet.create({
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
    opacity: 0.2,
  },
});
