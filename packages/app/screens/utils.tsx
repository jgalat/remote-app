import { StyleSheet } from "react-native";

import Text from "../components/text";
import Screen from "../components/screen";
import ErrorMessage from "../components/error-message";

export function LoadingScreen() {
  return (
    <Screen style={styles.message}>
      <Text style={styles.title}>Retrieving...</Text>
    </Screen>
  );
}

export type ErrorScreenProps = { error: Error };

export function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <Screen style={styles.message}>
      <ErrorMessage error={error} />
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
