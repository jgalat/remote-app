import * as React from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import {
  HTTPError,
  TransmissionError,
  ResponseParseError,
} from "@remote-app/transmission-client";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import { File, Paths } from "expo-file-system/next";

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

  if (error instanceof ResponseParseError) {
    title = "Unexpected response";
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
        {error instanceof ResponseParseError && (
          <Button
            onPress={() => {
              const file = new File(Paths.cache, "response.html");
              file.write(error.body);
              startActivityAsync("android.intent.action.VIEW", {
                data: file.contentUri,
                flags: 1,
                type: "text/html",
              });
            }}
            title="Show response"
          />
        )}
        <Button onPress={refetch} title="Retry" />
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
