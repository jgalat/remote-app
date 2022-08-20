import * as React from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { HTTPError, TransmissionError } from "@remote-app/transmission-client";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";

import View from "./view";
import Text from "./text";
import Button from "./button";
import { useTheme } from "../hooks/use-theme-color";
import { useTorrents } from "../hooks/use-transmission";

type ErrorMessageProps = {
  error: Error;
} & React.ComponentProps<typeof View>;

export default function ({ error, style, ...props }: ErrorMessageProps) {
  const linkTo = useLinkTo();
  const { red } = useTheme();
  const { mutate } = useTorrents();

  let title = "Failed to connect";
  let message = error.message;
  if (error instanceof HTTPError) {
    message = `${error.status}: ${error.message}`;
  }

  if (error instanceof TransmissionError) {
    title = "Transmission Error";
  }

  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={[styles.text, { color: red }]}>{title}</Text>
      <Text style={[styles.text, { color: red }]}>{message}</Text>
      <View style={styles.buttons}>
        <Button
          onPress={() => linkTo("/settings/connection")}
          title="Connection Settings"
        />
        <Button
          onPress={() => startActivityAsync(ActivityAction.WIFI_SETTINGS)}
          title="Network Settings"
        />
        <Button onPress={() => mutate()} title="Retry" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 16,
  },
  buttons: {
    marginTop: 16,
  }
});
