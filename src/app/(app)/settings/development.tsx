import * as React from "react";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import Text from "~/components/text";
import Screen from "~/components/screen";
import Button from "~/components/button";
import { SettingsListRow, SettingsSectionTitle } from "~/components/settings";
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
      <SettingsSectionTitle title="Navigation" first />
      <SettingsListRow style={styles.row}>
        <Button
          title="Go to _sitemap"
          onPress={async () => {
            router.push("/_sitemap");
          }}
        />
      </SettingsListRow>
      <SettingsSectionTitle title="Task" />
      <SettingsListRow style={styles.row}>
        <Button
          title="Trigger background task"
          onPress={async () => {
            const result = await TorrentsNotifierTask();
            console.log("[dev] Task result:", result);
          }}
        />
      </SettingsListRow>
      <SettingsSectionTitle title="Notifications" />
      <SettingsListRow style={styles.row}>
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
      </SettingsListRow>
      <SettingsSectionTitle title="Pro" />
      <SettingsListRow style={styles.row}>
        <Button
          title={devOverride ? "Disable Pro Override" : "Enable Pro Override"}
          onPress={() => setDevOverride(!devOverride)}
        />
      </SettingsListRow>
      <SettingsSectionTitle title="Servers" />
      <SettingsListRow style={styles.row}>
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
      </SettingsListRow>
      <SettingsSectionTitle title="Device ID" />
      <SettingsListRow style={styles.row}>
        <Text selectable style={styles.deviceId}>{deviceId}</Text>
        <Button
          title="Update Device ID"
          onPress={() => setDeviceId(updateDeviceId())}
        />
      </SettingsListRow>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 16,
    marginBottom: 12,
    padding: 12,
  },
  deviceId: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
  },
});
