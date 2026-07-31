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

type ConnectionTestResult = {
  connected: boolean;
  message: string;
};

type ConnectionTestProps = {
  data?: ConnectionTestResult;
  isPending: boolean;
  onPress: () => void;
  onDetails?: () => void;
  style?: StyleProp<ViewStyle>;
};

function failureMessage(message: string): string {
  const match = message.match(/timed out after (\d+)ms/i);
  if (match) {
    const seconds = Number(match[1]) / 1_000;
    return `No response after ${seconds} seconds`;
  }
  if (/timed out/i.test(message)) return "No response after 30 seconds";
  return message;
}

export default React.memo(function ConnectionTest({
  data,
  isPending,
  onPress,
  onDetails,
  style,
}: ConnectionTestProps) {
  const { gray, green, lightestGray, red, text, tint } = useTheme();
  const failed = Boolean(data && !data.connected);
  const canOpenDetails = failed && Boolean(onDetails);

  const state = isPending
    ? {
        color: tint,
        icon: null,
        title: "Testing connection",
        message: "Waiting, up to 30 seconds",
        action: "Testing",
      }
    : data?.connected
      ? {
          color: green,
          icon: "check-circle" as const,
          title: "Connected",
          message: "Server responded successfully",
          action: "Test",
        }
      : failed
        ? {
            color: red,
            icon: "alert-circle" as const,
            title: "Couldn’t connect",
            message: failureMessage(data?.message ?? "Connection failed"),
            action: "Retry",
          }
        : {
            color: gray,
            icon: "circle" as const,
            title: "Not tested",
            message: "Checks without saving",
            action: "Test",
          };

  return (
    <View style={[styles.container, { borderColor: lightestGray }, style]}>
      <Pressable
        accessibilityRole={canOpenDetails ? "button" : undefined}
        accessibilityLabel={
          canOpenDetails
            ? `Connection failed: ${state.message}. View debug details`
            : `${state.title}. ${state.message}`
        }
        disabled={!canOpenDetails}
        onPress={canOpenDetails ? onDetails : undefined}
        style={styles.status}
      >
        <View style={styles.icon}>
          {isPending ? (
            <ActivityIndicator size="small" color={state.color} />
          ) : (
            <Feather name={state.icon!} size={20} color={state.color} />
          )}
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {state.title}
          </Text>
          <Text color={state.color} style={styles.message} numberOfLines={1}>
            {state.message}
          </Text>
        </View>
        <View style={styles.chevron}>
          {canOpenDetails ? (
            <Feather name="chevron-right" size={18} color={red} />
          ) : null}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={state.action}
        disabled={isPending}
        onPress={onPress}
        style={[styles.action, { borderColor: text }]}
      >
        <Text style={styles.actionText} numberOfLines={1}>
          {state.action}
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
