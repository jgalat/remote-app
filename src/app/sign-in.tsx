import * as React from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import Screen from "~/components/screen";
import Text from "~/components/text";
import Button from "~/components/button";
import useAuth from "~/hooks/use-auth";

export default function SignIn() {
  const { unlock } = useAuth();
  const { t } = useTranslation();

  const { href } = useLocalSearchParams<{ href?: string }>();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>{t("remote_for_transmission")}</Text>
      <Text style={styles.text}>{t("unlock_to_continue")}</Text>
      <Button onPress={() => unlock(href)} title={t("authenticate")} />
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
