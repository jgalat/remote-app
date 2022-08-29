import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import View from "./view";
import Badge from "./badge";
import { useTheme } from "../hooks/use-theme-color";

export type OptionProps = {
  label: string;
  left: React.ComponentProps<typeof Feather>["name"] | number;
  right?: React.ComponentProps<typeof Feather>["name"];
  color?: string;
} & React.ComponentProps<typeof TouchableOpacity>;

export default function Option({
  label,
  left,
  right,
  onPress,
  disabled = false,
  style,
  color,
  ...props
}: OptionProps) {
  const { gray, text } = useTheme();
  const optionColor = disabled ? gray : color ? color : text;
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : undefined}
      {...props}
    >
      <View>
        {typeof left === "number" ? (
          <Badge label={left} />
        ) : (
          <Feather name={left} size={24} color={optionColor} />
        )}
      </View>
      <View style={styles.label}>
        <Text color={optionColor}>{label}</Text>
      </View>
      <View>
        {right ? <Feather name={right} size={24} color={gray} /> : null}
      </View>
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
