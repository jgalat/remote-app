import * as React from "react";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import View from "~/components/view";
import Text from "~/components/text";
import Screen from "~/components/screen";
import Button from "~/components/button";
import TorrentsNotifierTask from "~/tasks/torrents-notifier";
import { useServersStore } from "~/hooks/use-settings";
import { usePro, getDeviceId, updateDeviceId } from "@remote-app/pro";
import { generateServerId } from "~/store/settings";

export default function Development() {
  const router = useRouter();
  const { store } = useServersStore();
  const { devOverride, setDevOverride } = usePro();
  const [deviceId, setDeviceId] = React.useState(() => getDeviceId());
  return (
    <Screen variant="scroll">
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
          title="Trigger background task"
          onPress={async () => {
            const result = await TorrentsNotifierTask();
            console.log("[dev] Task result:", result);
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
      <Text style={[styles.title]}>Pro</Text>
      <View style={styles.row}>
        <Button
          title={devOverride ? "Disable Pro Override" : "Enable Pro Override"}
          onPress={() => setDevOverride(!devOverride)}
        />
      </View>
      <Text style={[styles.title]}>Servers</Text>
      <View style={styles.row}>
        <Button
          title="Mock server"
          onPress={async () => {
            const now = Date.now();
            const id = generateServerId();
            store({
              servers: [{ id, name: "app", url: "app-testing-url", type: "transmission" as const, createdAt: now, updatedAt: now }],
              activeServerId: id,
            });
          }}
        />
        <Button
          title="Local Transmission"
          onPress={async () => {
            const now = Date.now();
            const id = generateServerId();
            store({
              servers: [{
                id,
                name: "transmission",
                url: "http://192.168.0.201:9091/transmission/rpc",
                type: "transmission" as const,
                username: "test",
                password: "test",
                createdAt: now,
                updatedAt: now,
              }],
              activeServerId: id,
            });
          }}
        />
        <Button
          title="Local qBittorrent"
          onPress={async () => {
            const now = Date.now();
            const id = generateServerId();
            store({
              servers: [{
                id,
                name: "qbittorrent",
                url: "http://192.168.0.201:8080",
                type: "qbittorrent" as const,
                username: "test",
                password: "test",
                createdAt: now,
                updatedAt: now,
              }],
              activeServerId: id,
            });
          }}
        />
      </View>
      <Text style={[styles.title]}>Device ID</Text>
      <View style={styles.row}>
        <Text selectable style={styles.deviceId}>{deviceId}</Text>
        <Button
          title="Update Device ID"
          onPress={() => setDeviceId(updateDeviceId())}
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
  deviceId: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
  },
});
