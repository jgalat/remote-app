import * as React from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

import Screen from "~/components/screen";
import Text from "~/components/text";
import Button from "~/components/button";
import useAuth from "~/hooks/use-auth";

export default function SignIn() {
  const { unlock } = useAuth();

  const { href } = useLocalSearchParams<{ href?: string }>();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Remote for Transmission</Text>
      <Text style={styles.text}>Unlock to continue</Text>
      <Button onPress={() => unlock(href)} title="Authenticate" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 24,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
  },
});
