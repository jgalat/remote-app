import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";

import View from "./view";
import Text from "./text";
import { useTheme } from "../hooks/use-theme-color";

type KeyValueProps = {
  field: string;
  value: string | number;
};

export default function KeyValue({ field, value }: KeyValueProps) {
  const { gray } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={styles.field}>{field}</Text>

      <ScrollView horizontal fadingEdgeLength={64}>
        <Text style={[styles.value, { color: gray }]}>{value}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  field: {
    fontFamily: "RobotoMono-Medium",
    width: "25%",
    overflow: "scroll",
  },
  value: {
    flex: 1,
  },
});
