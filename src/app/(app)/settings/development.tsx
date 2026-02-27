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
import { debugHref } from "~/lib/debug-href";

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
      <SettingsSectionTitle title="Debug Screen" />
      <SettingsListRow style={styles.row}>
        <Button
          title="Test debug (long error)"
          onPress={() => {
            router.push(debugHref({
              url: "https://my-server.example.com:9091/transmission/rpc",
              username: "admin",
              password: "hunter2",
              errorName: "HTTPError",
              errorMessage: "<!DOCTYPE html><html><head><title>401 Unauthorized</title></head><body><h1>401 Unauthorized</h1><p>This server could not verify that you are authorized to access the document requested. Either you supplied the wrong credentials (e.g., bad password), or your browser doesn't understand how to supply the credentials required.</p><p>Additionally, a 401 Unauthorized error was encountered while trying to use an ErrorDocument to handle the request.</p><hr><address>Apache/2.4.41 (Ubuntu) Server at my-server.example.com Port 9091</address></body></html>",
              errorStatus: 401,
              errorBody: "<html><body><h1>401 Unauthorized</h1></body></html>",
            }));
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
