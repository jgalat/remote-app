import * as React from "react";
import { Pressable, ScrollView, StyleSheet, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

import View from "./view";
import Text from "./text";
import { useTheme } from "../hooks/use-theme-color";

export type KeyValueProps = {
  field: string;
  value: string | number;
  copy?: boolean;
};

export default function KeyValue({ field, value, copy }: KeyValueProps) {
  const { gray, tint } = useTheme();

  const onCopy = React.useCallback(async () => {
    await Clipboard.setStringAsync(value.toString());
    ToastAndroid.show("Magnet Link copied", ToastAndroid.SHORT);
  }, [value]);

  return React.useMemo(
    () => (
      <View style={styles.row}>
        <Text style={styles.field}>{field}</Text>

        <ScrollView horizontal fadingEdgeLength={64}>
          {copy ? (
            <Pressable
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                ...styles.pressable,
              })}
              onPress={onCopy}
            >
              <Feather name="clipboard" color={tint} size={16} />
              <Text style={[styles.value, { color: tint }]}> {value}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.value, { color: gray }]}>{value}</Text>
          )}
        </ScrollView>
      </View>
    ),
    [field, value, copy, onCopy, gray, tint]
  );
}

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
