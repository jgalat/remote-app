import * as React from "react";
import { StyleSheet } from "react-native";

import View from "./view";
import { useTheme } from "~/hooks/use-theme-color";

export default React.memo(function Separator() {
  const { lightGray } = useTheme();
  return <View style={[styles.separator, { backgroundColor: lightGray }]} />;
});

const styles = StyleSheet.create({
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
  },
});
