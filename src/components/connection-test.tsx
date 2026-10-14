import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import StatusCard from "~/components/status-card";
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
  const { gray, green, red, tint } = useTheme();
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
    <StatusCard
      {...state}
      pending={isPending}
      onPress={onPress}
      onDetails={canOpenDetails ? onDetails : undefined}
      detailsLabel={`Connection failed: ${state.message}. View debug details`}
      style={style}
    />
  );
});
