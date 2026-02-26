import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import View from "~/components/view";

type SettingsListRowProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function SettingsListRow({
  children,
  style,
}: SettingsListRowProps) {
  return <View style={style}>{children}</View>;
});
