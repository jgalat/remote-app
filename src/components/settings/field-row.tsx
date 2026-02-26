import * as React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";

import Text from "~/components/text";
import { useTheme } from "~/hooks/use-theme-color";

type FieldRowProps = {
  children: React.ReactNode;
  label?: React.ReactNode;
  error?: string;
  reserveErrorSpace?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export default React.memo(function FieldRow({
  children,
  label,
  error,
  reserveErrorSpace = false,
  style,
  labelStyle,
}: FieldRowProps) {
  const { red } = useTheme();

  return (
    <View
      style={[
        styles.row,
        reserveErrorSpace && styles.rowReservedError,
        style,
      ]}
    >
      {label ? (
        <View style={styles.labelWrap}>
          {typeof label === "string" ? (
            <Text style={[styles.label, labelStyle]}>{label}</Text>
          ) : (
            label
          )}
        </View>
      ) : null}
      {children}
      {error || reserveErrorSpace ? (
        <Text
          color={red}
          style={[styles.error, reserveErrorSpace && styles.errorReservedSpace]}
        >
          {error ?? " "}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    marginBottom: 14,
  },
  rowReservedError: {
    marginBottom: 0,
  },
  labelWrap: {
    marginBottom: 8,
  },
  label: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  errorReservedSpace: {
    minHeight: 14,
  },
});
