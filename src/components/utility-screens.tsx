import * as React from "react";
import { StyleSheet } from "react-native";

import Screen from "~/components/screen";
import ActivityIndicator from "~/components/activity-indicator";
import NetworkErrorMessage from "~/components/network-error-message";

export function LoadingScreen() {
  return (
    <Screen style={styles.message}>
      <ActivityIndicator />
    </Screen>
  );
}

export type ErrorScreenProps = { error: Error; refetch: () => void };

export function NetworkErrorScreen({ error, refetch }: ErrorScreenProps) {
  return (
    <Screen style={styles.message}>
      <NetworkErrorMessage error={error} refetch={refetch} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
