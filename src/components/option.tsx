import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "./text";
import Badge from "./badge";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";

export type OptionProps = {
  id?: string;
  label: string;
  left: React.ComponentProps<typeof Feather>["name"] | number;
  right?: React.ComponentProps<typeof Feather>["name"];
  value?: string;
  color?: string;
  showChevron?: boolean;
  variant?: "default" | "compact";
} & PressableProps;

export default React.memo(function Option({
  label,
  left,
  right,
  value,
  onPress,
  style,
  color,
  showChevron = false,
  variant = "default",
  ...props
}: OptionProps) {
  const { text, gray } = useTheme();
  const optionColor = color ? color : text;
  const rightIcon = right ?? (showChevron ? "chevron-right" : undefined);
  const rightColor = rightIcon === "chevron-right" ? gray : optionColor;

  return (
    <Pressable
      style={[
        styles.container,
        variant === "compact" ? styles.compact : styles.default,
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      <View style={styles.left}>
        {typeof left === "number" ? (
          <Badge label={left} />
        ) : (
          <Feather name={left} size={24} color={optionColor} />
        )}
      </View>
      <View style={styles.label}>
        <Text color={optionColor} numberOfLines={1}>
          {label}
        </Text>
      </View>
      {(value || rightIcon) && (
        <View style={styles.right}>
          {value ? (
            <Text color={gray} numberOfLines={1} style={styles.value}>
              {value}
            </Text>
          ) : null}
          {rightIcon ? <Feather name={rightIcon} size={20} color={rightColor} /> : null}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  default: {
    marginBottom: 32,
    paddingVertical: 12,
  },
  compact: {
    marginBottom: 0,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  left: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    marginLeft: 16,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    maxWidth: "55%",
  },
  value: {
    fontSize: 13,
    marginRight: 8,
  },
});
