import * as React from "react";
import {
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  StyleSheet,
  TextInputEndEditingEventData,
  ToastAndroid,
} from "react-native";
import { SessionGetResponse } from "@remote-app/transmission-client";

import Toggle from "~/components/toggle";
import Text from "~/components/text";
import View from "~/components/view";
import TextInput from "~/components/text-input";
import Screen from "~/components/screen";
import { useSession, useSessionSet } from "~/hooks/use-transmission";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";

export default function ServerConfigurationScreen() {
  const { data: session, isLoading, error, refetch } = useSession();
  const { mutate } = useSessionSet();

  const onEndEditing = React.useCallback(
    (field: keyof SessionGetResponse) =>
      ({
        nativeEvent: { text },
      }: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
        const value = Number(text.replace(/[^0-9]/g, ""));
        const current = session?.[field];
        if (typeof current !== "number" || current === value) {
          return;
        }

        mutate(
          { [field]: value },
          {
            onSuccess: () => {
              ToastAndroid.show(
                "Server updated successfully",
                ToastAndroid.SHORT
              );
            },
            onError: () => {
              ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
            },
          }
        );
      },
    [mutate, session]
  );

  const onUpdate = React.useCallback(
    (field: keyof SessionGetResponse) => (value: boolean) => {
      const current = session?.[field];
      if (typeof current !== "boolean" || current === value) {
        return;
      }

      mutate(
        { [field]: value },
        {
          onSuccess: () => {
            ToastAndroid.show(
              "Server updated successfully",
              ToastAndroid.SHORT
            );
          },
          onError: () => {
            ToastAndroid.show("Failed to update server", ToastAndroid.SHORT);
          },
        }
      );
    },
    [mutate, session]
  );

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !session) {
    return <LoadingScreen />;
  }

  return (
    <Screen variant="scroll">
      <KeyboardAvoidingView behavior="position">
        <Text style={[styles.title, { marginTop: 0 }]}>Speed limits</Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Toggle
              value={session["speed-limit-down-enabled"]}
              onPress={onUpdate("speed-limit-down-enabled")}
              label="Download (kB/s)"
            />
          </View>
          <TextInput
            editable={session["speed-limit-down-enabled"]}
            keyboardType="numeric"
            onEndEditing={onEndEditing("speed-limit-down")}
            defaultValue={String(session["speed-limit-down"])}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.label}>
            <Toggle
              value={session["speed-limit-up-enabled"]}
              onPress={onUpdate("speed-limit-up-enabled")}
              label="Upload (kB/s)"
            />
          </View>
          <TextInput
            editable={session["speed-limit-up-enabled"]}
            keyboardType="numeric"
            onEndEditing={onEndEditing("speed-limit-up")}
            defaultValue={String(session["speed-limit-up"])}
          />
        </View>

        <Text style={styles.title}>Alternative speed limits</Text>

        <View style={styles.row}>
          <Toggle
            value={session["alt-speed-enabled"]}
            onPress={onUpdate("alt-speed-enabled")}
            label="Enable alternative speed limits"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Download (kB/s)</Text>
          <TextInput
            keyboardType="numeric"
            onEndEditing={onEndEditing("alt-speed-down")}
            defaultValue={String(session["alt-speed-down"])}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Upload (kB/s)</Text>
          <TextInput
            keyboardType="numeric"
            onEndEditing={onEndEditing("alt-speed-up")}
            defaultValue={String(session["alt-speed-up"])}
          />
        </View>

        <Text style={styles.title}>Queue</Text>

        <View style={styles.row}>
          <View style={styles.label}>
            <Toggle
              value={session["download-queue-enabled"]}
              onPress={onUpdate("download-queue-enabled")}
              label="Download queue"
            />
          </View>
          <TextInput
            editable={session["download-queue-enabled"]}
            keyboardType="numeric"
            onEndEditing={onEndEditing("download-queue-size")}
            defaultValue={String(session["download-queue-size"])}
          />
        </View>
        <View style={[styles.row]}>
          <View style={styles.label}>
            <Toggle
              value={session["seed-queue-enabled"]}
              onPress={onUpdate("seed-queue-enabled")}
              label="Seed queue"
            />
          </View>
          <TextInput
            editable={session["seed-queue-enabled"]}
            keyboardType="numeric"
            onEndEditing={onEndEditing("seed-queue-size")}
            defaultValue={String(session["seed-queue-size"])}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 16,
    marginTop: 24,
  },
  row: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
});
