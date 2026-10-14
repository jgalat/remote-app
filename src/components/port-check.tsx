import * as React from "react";
import type { StyleProp, ViewStyle } from "react-native";

import type { PortCheck as PortCheckResult } from "~/client/types";
import StatusCard from "~/components/status-card";
import { useTheme } from "~/hooks/use-theme-color";

type PortCheckProps = {
  data?: PortCheckResult;
  error: Error | null;
  isPending: boolean;
  // qBittorrent reports whether it has seen incoming connections instead of
  // actively testing the port.
  statusOnly?: boolean;
  // The form has a port change that the check will save first.
  unsaved?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default React.memo(function PortCheck({
  data,
  error,
  isPending,
  statusOnly = false,
  unsaved = false,
  onPress,
  style,
}: PortCheckProps) {
  const { gray, green, red, tint } = useTheme();
  const action = statusOnly ? "Check" : "Test";
  // qBittorrent reports port 0 when it listens on a random port.
  const portLabel = data?.port ? `Port ${data.port}` : "Random port";

  const state = isPending
    ? {
        color: tint,
        icon: null,
        title: statusOnly ? "Checking port" : "Testing port",
        message: statusOnly ? "Asking the server" : "Waiting, up to 20 seconds",
        action: statusOnly ? "Checking" : "Testing",
      }
    : unsaved
      ? {
          color: gray,
          icon: "circle" as const,
          title: "Port changed",
          message: statusOnly
            ? "Saves the port, then checks it"
            : "Saves the port, then tests it",
          action: "Save",
        }
      : error
        ? {
            color: red,
            icon: "alert-circle" as const,
            title: "Couldn’t test port",
            message: error.message || "Unknown error",
            action: "Retry",
          }
        : data?.open
          ? {
              color: green,
              icon: "check-circle" as const,
              title: `${portLabel} is open`,
              message: statusOnly
                ? "Receiving incoming connections"
                : "Peers can connect to you",
              action,
            }
          : data
            ? {
                color: red,
                icon: "alert-circle" as const,
                title: statusOnly
                  ? `${portLabel} is firewalled`
                  : `${portLabel} is closed`,
                message: statusOnly
                  ? "No incoming connections yet"
                  : "Peers can’t connect to you",
                action,
              }
            : {
                color: gray,
                icon: "circle" as const,
                title: "Port check",
                message: "Checks if peers can reach you",
                action,
              };

  return (
    <StatusCard
      {...state}
      pending={isPending}
      onPress={onPress}
      style={style}
    />
  );
});
