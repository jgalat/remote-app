import * as React from "react";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";

import View from "~/components/view";
import Screen from "~/components/screen";
import Button from "~/components/button";

export default function Development() {
  return (
    <Screen variant="scroll">
      <View style={styles.row}>
        <Button
          title="Trigger background task"
          onPress={async () => {
            await BackgroundTask.triggerTaskWorkerForTestingAsync();
          }}
        />
      </View>
      <View style={styles.row}>
        <Button
          title="Trigger test notification"
          onPress={async () => {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Test notification",
                body: "This is a test notification",
              },
              trigger: null,
            });
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 16,
  },
});
