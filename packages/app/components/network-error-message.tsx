import * as React from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { HTTPError, TransmissionError } from "@remote-app/transmission-client";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";

import View, { ViewProps } from "./view";
import Text from "./text";
import Button from "./button";
import { useTheme } from "../hooks/use-theme-color";
import { useTorrents } from "../hooks/use-transmission";

export type NetworkErrorMessageProps = {
  error: Error;
} & ViewProps;

export default React.memo(function NetworkErrorMessage({
  error,
  style,
  ...props
}: NetworkErrorMessageProps) {
  const linkTo = useLinkTo();
  const { red } = useTheme();
  const { mutate } = useTorrents();

  let title = "Failed to connect";
  let message = error.message;
  if (error instanceof HTTPError) {
    if (!error.message) {
      message = `HTTP Status ${error.status}`;
    } else {
      message = `${error.status}: ${error.message}`;
    }
  }

  if (error instanceof TransmissionError) {
    title = "Transmission Error";
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
    marginTop: 20,
  },
});
