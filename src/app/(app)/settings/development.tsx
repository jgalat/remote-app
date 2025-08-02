import * as React from "react";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import View from "~/components/view";
import Text from "~/components/text";
import Screen from "~/components/screen";
import Button from "~/components/button";
import {
  unregisterTorrentsNotifierTask,
  registerTorrentsNotifierTask,
} from "~/tasks/torrents-notifier";

export default function Development() {
  return (
    <Screen>
      <Text style={[styles.title, { marginTop: 0 }]}>Task</Text>
      <View style={styles.row}>
        <Button
          title="Unregister/Register background task"
          onPress={async () => {
            await unregisterTorrentsNotifierTask();
            await registerTorrentsNotifierTask();
            console.log(await TaskManager.getRegisteredTasksAsync());
          }}
        />
        <Button
          title="Trigger background task"
          onPress={async () => {
            await BackgroundTask.triggerTaskWorkerForTestingAsync();
          }}
        />
      </View>
      <Text style={[styles.title, { marginTop: 0 }]}>Notifications</Text>
      <View style={styles.row}>
        <Button
          title="Trigger test notification"
          onPress={async () => {
            await Notifications.requestPermissionsAsync();
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
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 16,
  },
  row: {
    marginBottom: 16,
  },
});
