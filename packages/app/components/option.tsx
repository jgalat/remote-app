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
} & React.ComponentProps<typeof TouchableOpacity>;

export default function Option({
  label,
  left,
  right,
  onPress,
  disabled = false,
  style,
  ...props
}: OptionProps) {
  const { gray, text } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <View>
        <Feather name={left} size={24} color={disabled ? gray : text} />
      </View>
      <View style={styles.label}>
        <Text color={disabled ? gray : text}>{label}</Text>
      </View>
      <View>{right && <Feather name={right} size={24} color={gray} />}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
