import * as React from "react";
import { StyleSheet } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import View from "~/components/view";
import { useTheme } from "~/hooks/use-theme-color";

type SettingsInsetDividerProps = {
  inset?: number;
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function SettingsInsetDivider({
  inset = 40,
  style,
}: SettingsInsetDividerProps) {
  const { lightestGray } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: lightestGray,
          marginLeft: inset,
          marginRight: inset,
        },
        style,
      ]}
    />
  );
});

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
