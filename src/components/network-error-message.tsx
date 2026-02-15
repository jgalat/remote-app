import * as React from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { HTTPError, TransmissionError } from "@remote-app/transmission-client";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import { useTranslation } from "react-i18next";

import View, { ViewProps } from "./view";
import Text from "./text";
import Button from "./button";
import { useTheme } from "../hooks/use-theme-color";

export type NetworkErrorMessageProps = {
  error: Error;
  refetch: () => void;
} & ViewProps;

export default React.memo(function NetworkErrorMessage({
  error,
  refetch,
  style,
  ...props
}: NetworkErrorMessageProps) {
  const linkTo = useLinkTo();
  const { red } = useTheme();
  const { t } = useTranslation();

  let title = t("failed_to_connect");
  let message = error.message;
  if (error instanceof HTTPError) {
    if (!error.message) {
      message = t("http_status", { status: error.status });
    } else {
      message = t("http_status_message", { status: error.status, message: error.message });
    }
  }

  if (error instanceof TransmissionError) {
    title = t("transmission_error");
  }

  return (
    <View style={[styles.container, style]} {...props}>
      <Text color={red} style={styles.text}>
        {title}
      </Text>
      <Text color={red} style={styles.text}>
        {message}
      </Text>
      <View style={styles.buttons}>
        <Button
          onPress={() => linkTo("/settings/connection")}
          title={t("connection_settings")}
        />
        <Button
          onPress={() => startActivityAsync(ActivityAction.WIFI_SETTINGS)}
          title={t("network_settings")}
        />
        <Button onPress={refetch} title={t("retry")} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 20,
  },
  buttons: {
    gap: 16,
    marginTop: 20,
  },
});
