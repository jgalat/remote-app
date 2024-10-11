import * as React from "react";
import { ScrollView, StyleSheet, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

import View from "./view";
import Text from "./text";
import Pressable from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type KeyValueProps = {
  field: string;
  value: string | number;
  copy?: boolean;
};

export default React.memo(function KeyValue({
  field,
  value,
  copy,
}: KeyValueProps) {
  const { gray, tint } = useTheme();

  const onCopy = React.useCallback(async () => {
    await Clipboard.setStringAsync(value.toString());
    ToastAndroid.show("Magnet Link copied", ToastAndroid.SHORT);
  }, [value]);

  return (
    <View style={styles.row}>
      <Text style={styles.field}>{field}</Text>

      <ScrollView horizontal fadingEdgeLength={64}>
        {copy ? (
          <Pressable style={styles.pressable} onPress={onCopy}>
            <Feather name="clipboard" color={tint} size={16} />
            <Text style={[styles.value, { color: tint }]}> {value}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.value, { color: gray }]}>{value}</Text>
        )}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  field: {
    fontFamily: "RobotoMono-Medium",
    width: "35%",
    overflow: "scroll",
  },
  value: {
    flex: 1,
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
  },
});
