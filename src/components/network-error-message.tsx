import * as React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";
import View, { ViewProps } from "./view";
import Text from "./text";
import Button from "./button";
import { useTheme } from "~/hooks/use-theme-color";
import { useServer } from "~/hooks/use-settings";
import { debugHref } from "~/lib/debug-href";
import {
  getNetworkErrorContent,
  hasErrorBody,
  hasErrorStatus,
} from "~/utils/network-error";

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
  const router = useRouter();
  const { red } = useTheme();
  const server = useServer();
  const { title, message } = getNetworkErrorContent(error);

  const onDebug = React.useCallback(() => {
    if (!server) return;
    router.push(debugHref({
      url: server.url,
      username: server.username,
      password: server.password,
      errorName: error.name,
      errorMessage: error.message,
      errorStatus: hasErrorStatus(error) ? error.status : undefined,
      errorBody: hasErrorBody(error) ? error.body : undefined,
    }));
  }, [server, error, router]);

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
          onPress={() =>
            router.push(
              server
                ? `/settings/connection?id=${server.id}`
                : "/settings/connection",
            )
          }
          title="Connection Settings"
        />
        <Button
          onPress={() => startActivityAsync(ActivityAction.WIFI_SETTINGS)}
          title="Network Settings"
        />
        <Button onPress={onDebug} title="Debug" />
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
