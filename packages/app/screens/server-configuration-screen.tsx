import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { SessionGetResponse } from "@remote-app/transmission-client";

import Checkbox from "../components/checkbox";
import Text from "../components/text";
import View from "../components/view";
import TextInput from "../components/text-input";
import Screen from "../components/screen";
import ErrorMessage from "../components/error-message";
import { useSession, useSessionSet } from "../hooks/use-transmission";

export default function ServerConfigurationScreen() {
  const { data: session, error } = useSession();
  const sessionSet = useSessionSet();
  const [state, setState] = React.useState<SessionGetResponse | undefined>();

  React.useLayoutEffect(() => {
    if (!session) {
      return;
    }

    setState(session);
  }, [session]);

  const onBlur = React.useCallback(
    (field: keyof SessionGetResponse) => async () => {
      if (!state) {
        return;
      }

      try {
        await sessionSet({ [field]: state[field] });
        ToastAndroid.show("Server updated successfully", ToastAndroid.SHORT);
      } catch (e) {
        ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
      }
    },
    [state, sessionSet]
  );

  const update = React.useCallback(
    (field: keyof SessionGetResponse) => async (value: string | boolean) => {
      if (!state) {
        return;
      }

      if (typeof state[field] === "number" && typeof value === "string") {
        setState({ ...state, [field]: +value.replace(/[^0-9]/g, "") });
      }

      if (typeof state[field] === "boolean" && typeof value === "boolean") {
        try {
          await sessionSet({ [field]: value });
          ToastAndroid.show("Server updated successfully", ToastAndroid.SHORT);
        } catch (e) {
          ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
        }
      }
    },
    [state, setState, sessionSet]
  );

  if (error || !session) {
    return (
      <Screen style={styles.message}>
        <ErrorMessage error={error} />
      </Screen>
    );
  }

  if (!state) {
    return (
      <Screen style={styles.message}>
        <Text>Retrieving...</Text>
      </Screen>
    );
  }

  return (
    <Screen variant="scroll">
      <Text style={styles.title}>Speed limits</Text>

      <View style={styles.row}>
        <View style={styles.left}>
          <Checkbox
            value={state["speed-limit-down-enabled"]}
            onPress={update("speed-limit-down-enabled")}
            label="Download (kB/s)"
          />
        </View>
        <TextInput
          containerStyle={styles.input}
          editable={state["speed-limit-down-enabled"]}
          keyboardType="numeric"
          onChangeText={update("speed-limit-down")}
          onBlur={onBlur("speed-limit-down")}
          value={state["speed-limit-down"].toString()}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.left}>
          <Checkbox
            value={state["speed-limit-up-enabled"]}
            onPress={update("speed-limit-up-enabled")}
            label="Upload (kB/s)"
          />
        </View>
        <TextInput
          containerStyle={styles.input}
          editable={state["speed-limit-up-enabled"]}
          keyboardType="numeric"
          onChangeText={update("speed-limit-up")}
          onBlur={onBlur("speed-limit-up")}
          value={state["speed-limit-up"].toString()}
        />
      </View>

      <Text style={[styles.title, { marginTop: 24 }]}>
        Alternative speed limits
      </Text>

      <View style={styles.row}>
        <Checkbox
          value={state["alt-speed-enabled"]}
          onPress={update("alt-speed-enabled")}
          label="Enable alternative speed limits"
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.left}>Download (kB/s)</Text>
        <TextInput
          containerStyle={styles.input}
          keyboardType="numeric"
          onChangeText={update("alt-speed-down")}
          onBlur={onBlur("alt-speed-down")}
          value={state["alt-speed-down"].toString()}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.left}>Upload (kB/s)</Text>
        <TextInput
          containerStyle={styles.input}
          keyboardType="numeric"
          onChangeText={update("alt-speed-up")}
          onBlur={onBlur("alt-speed-up")}
          value={state["alt-speed-up"].toString()}
        />
      </View>

      <Text style={[styles.title, { marginTop: 24 }]}>Queue</Text>

      <View style={styles.row}>
        <View style={styles.left}>
          <Checkbox
            value={state["download-queue-enabled"]}
            onPress={update("download-queue-enabled")}
            label="Download queue"
          />
        </View>
        <TextInput
          containerStyle={styles.input}
          editable={state["download-queue-enabled"]}
          keyboardType="numeric"
          onChangeText={update("download-queue-size")}
          onBlur={onBlur("download-queue-size")}
          value={state["download-queue-size"].toString()}
        />
      </View>
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
    fontSize: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  left: {
    width: "50%",
    marginRight: 24,
  },
  input: {
    flexGrow: 1,
  },
});
