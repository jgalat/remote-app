import * as React from "react";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useRouter } from "expo-router";

import View from "~/components/view";
import Text from "~/components/text";
import Screen from "~/components/screen";
import Button from "~/components/button";
import {
  unregisterTorrentsNotifierTask,
  registerTorrentsNotifierTask,
} from "~/tasks/torrents-notifier";
import useSettings from "~/hooks/use-settings";

export default function Development() {
  const router = useRouter();
  const { store } = useSettings();
  return (
    <Screen>
      <Text style={[styles.title]}>Navigation</Text>
      <View style={styles.row}>
        <Button
          title="Go to _sitemap"
          onPress={async () => {
            router.push("/_sitemap");
          }}
        />
      </View>
      <Text style={[styles.title]}>Task</Text>
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
      <Text style={[styles.title]}>Notifications</Text>
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
      <Text style={[styles.title]}>Servers</Text>
      <View style={styles.row}>
        <Button
          title="Mock server"
          onPress={async () =>
            store({ server: { name: "app", url: "app-testing-url" } })
          }
        />
        <Button
          title="Local"
          onPress={async () =>
            store({
              server: {
                name: "app",
                url: "http://192.168.0.201:9091/transmission/rpc",
                username: "test",
                password: "test",
              },
            })
          }
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
    marginTop: 0,
  },
  row: {
    gap: 16,
    marginBottom: 16,
  },
});
