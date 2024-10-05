import * as React from "react";
import { StyleSheet } from "react-native";

import Text from "~/components/text";
import Screen from "~/components/screen";
import NetworkErrorMessage from "~/components/network-error-message";

export function LoadingScreen() {
  return (
    <Screen style={styles.message}>
      <Text style={styles.title}>Retrieving...</Text>
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
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 24,
    marginBottom: 24,
  },
});
