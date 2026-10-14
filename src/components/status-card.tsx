import * as React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import Pressable from "~/components/pressable";
import Text from "~/components/text";
import View from "~/components/view";
import { useTheme } from "~/hooks/use-theme-color";

type StatusCardProps = {
  color: string;
  icon: React.ComponentProps<typeof Feather>["name"] | null;
  title: string;
  message: string;
  action: string;
  pending?: boolean;
  onPress: () => void;
  onDetails?: () => void;
  detailsLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function StatusCard({
  color,
  icon,
  title,
  message,
  action,
  pending = false,
  onPress,
  onDetails,
  detailsLabel,
  style,
}: StatusCardProps) {
  const { lightestGray, red, text } = useTheme();

  return (
    <View style={[styles.container, { borderColor: lightestGray }, style]}>
      <Pressable
        accessibilityRole={onDetails ? "button" : undefined}
        accessibilityLabel={
          onDetails && detailsLabel ? detailsLabel : `${title}. ${message}`
        }
        disabled={!onDetails}
        onPress={onDetails}
        style={styles.status}
      >
        <View style={styles.icon}>
          {pending || !icon ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <Feather name={icon} size={20} color={color} />
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text color={color} style={styles.message} numberOfLines={1}>
            {message}
          </Text>
        </View>
        <View style={styles.chevron}>
          {onDetails ? (
            <Feather name="chevron-right" size={18} color={red} />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={action}
        disabled={pending}
        onPress={onPress}
        style={[styles.action, { borderColor: text }]}
      >
        <Text style={styles.actionText} numberOfLines={1}>
          {action}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 76,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  status: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    minWidth: 0,
    flex: 1,
    height: 42,
    justifyContent: "center",
    gap: 3,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  message: {
    fontSize: 11,
    lineHeight: 16,
  },
  chevron: {
    width: 18,
    alignItems: "center",
  },
  action: {
    width: 76,
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  actionText: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
  },
});
