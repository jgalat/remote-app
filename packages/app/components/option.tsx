import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import View from "./view";
import Badge from "./badge";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type OptionProps = {
  label: string;
  left: React.ComponentProps<typeof Feather>["name"] | number;
  right?: React.ComponentProps<typeof Feather>["name"];
  color?: string;
} & PressableProps;

export default React.memo(function Option({
  label,
  left,
  right,
  onPress,
  style,
  color,
  ...props
}: OptionProps) {
  const { gray, text } = useTheme();
  const optionColor = color ? color : text;
  return (
    <Pressable style={[styles.container, style]} onPress={onPress} {...props}>
      <View style={{ width: typeof left === "number" ? "15%" : "auto" }}>
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
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 32,
    minHeight: 32,
    paddingVertical: 12,
  },
  label: {
    flex: 1,
    marginLeft: 24,
  },
});
