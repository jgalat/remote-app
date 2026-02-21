import * as React from "react";
import { StyleSheet } from "react-native";
import { useLinkTo } from "@react-navigation/native";
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

function hasStatus(error: Error): error is Error & { status: number } {
  return "status" in error && typeof (error as { status: unknown }).status === "number";
}

function hasBody(error: Error): error is Error & { body: string } {
  return "body" in error && typeof (error as { body: unknown }).body === "string";
}

export default React.memo(function NetworkErrorMessage({
  error,
  refetch,
  style,
  ...props
}: NetworkErrorMessageProps) {
  const linkTo = useLinkTo();
  const { red } = useTheme();

  let title = "Failed to connect";
  let message = error.message || "Unknown error";

  if (hasStatus(error)) {
    title = error.message ? `${error.status}: ${error.message}` : `HTTP Status ${error.status}`;
    message = "";
  }

  if (error.name === "TransmissionError" || error.name === "QBittorrentError") {
    title = "Server Error";
  }

  if (hasBody(error)) {
    title = "Unexpected response";
    message = "";
  }

  return (
    <View style={[styles.container, style]} {...props}>
      <Text color={red} style={styles.text}>
        {title}
      </Text>
      {message ? (
        <Text color={red} style={styles.text}>
          {message}
        </Text>
      ) : null}
      <View style={styles.buttons}>
        <Button
          onPress={() => linkTo("/settings/connection")}
          title="Connection Settings"
        />
        <Button
          onPress={() => startActivityAsync(ActivityAction.WIFI_SETTINGS)}
          title="Network Settings"
        />
        {hasBody(error) && (
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
