import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import View from "./view";
import { useTheme } from "../hooks/use-theme-color";

export type OptionProps = {
  label: string;
  left: React.ComponentProps<typeof Feather>["name"];
  right?: React.ComponentProps<typeof Feather>["name"];
  onPress: React.ComponentProps<typeof TouchableOpacity>["onPress"];
};

export default function ({ label, left, right, onPress }: OptionProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View>
        <Feather name={left} size={24} color={theme.text} />
      </View>
      <View style={styles.label}>
        <Text>{label}</Text>
      </View>
      <View>
        {right && <Feather name={right} size={24} color={theme.icon} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 32,
    height: 32,
  },
  label: {
    flex: 1,
    marginLeft: 24,
  },
});
