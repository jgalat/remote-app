import * as React from "react";
import { SectionList, StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Screen from "~/components/screen";
import Option, { OptionProps } from "~/components/option";
import { SettingsSectionTitle } from "~/components/settings";
import TorrentsNotifierTask from "~/tasks/torrents-notifier";
import { useServersStore } from "~/hooks/use-settings";
import { useTheme } from "~/hooks/use-theme-color";
import { usePro, getAppId, generateAppId } from "@remote-app/pro";
import { generateServerId } from "~/store/settings";
import { storage } from "~/store/storage";
import { debugHref } from "~/lib/debug-href";

type DevSection = {
  key: string;
  title: string;
  data: OptionProps[];
};

function StorageInspector() {
  const { gray, lightGray } = useTheme();
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [keys, setKeys] = React.useState(() => storage.getAllKeys().sort());

  const toggle = React.useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    storage.clearAll();
    setKeys([]);
    setExpanded(new Set());
  }, []);

  return (
    <View>
      <SettingsSectionTitle title="Storage" variant="settings" />
      {keys.map((key) => {
        const isExpanded = expanded.has(key);
        const value = storage.getString(key);
        return (
          <Pressable
            key={key}
            style={styles.storageRow}
            onPress={() => toggle(key)}
          >
            <Text style={styles.storageKey} numberOfLines={isExpanded ? undefined : 1}>
              {key}
            </Text>
            {isExpanded && value != null && (
              <Text
                color={gray}
                style={styles.storageValue}
                selectable
              >
                {tryFormatJson(value)}
              </Text>
            )}
          </Pressable>
        );
      })}
      {keys.length === 0 && (
        <Text color={lightGray} style={styles.emptyText}>
          No keys stored
        </Text>
      )}
      {keys.length > 0 && (
        <Pressable style={styles.clearAll} onPress={clearAll}>
          <Text color="red">Clear All</Text>
        </Pressable>
      )}
    </View>
  );
}

function tryFormatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function Development() {
  const router = useRouter();
  const { store } = useServersStore();
  const { devOverride, setDevOverride } = usePro();
  const [appId, setAppId] = React.useState(() => getAppId());

  const sections = React.useMemo<DevSection[]>(() => {
    const navigation: OptionProps[] = [
      {
        id: "sitemap",
        left: "map",
        label: "Sitemap",
        showChevron: true,
        variant: "compact",
        onPress: () => router.push("/_sitemap"),
      },
    ];

    const actions: OptionProps[] = [
      {
        id: "task",
        left: "play",
        label: "Background Task",
        variant: "compact",
        onPress: async () => {
          const result = await TorrentsNotifierTask();
          console.log("[dev] Task result:", result);
        },
      },
      {
        id: "notification",
        left: "bell",
        label: "Test Notification",
        variant: "compact",
        onPress: async () => {
          await Notifications.requestPermissionsAsync();
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Test notification",
              body: "This is a test notification",
            },
            trigger: null,
          });
        },
      },
      {
        id: "debug",
        left: "alert-triangle",
        label: "Test Debug Screen",
        showChevron: true,
        variant: "compact",
        onPress: () => {
          router.push(debugHref({
            url: "https://my-server.example.com:9091/transmission/rpc",
            username: "admin",
            password: "hunter2",
            errorName: "HTTPError",
            errorMessage: "<!DOCTYPE html><html><head><title>401 Unauthorized</title></head><body><h1>401 Unauthorized</h1><p>This server could not verify that you are authorized to access the document requested. Either you supplied the wrong credentials (e.g., bad password), or your browser doesn't understand how to supply the credentials required.</p><p>Additionally, a 401 Unauthorized error was encountered while trying to use an ErrorDocument to handle the request.</p><hr><address>Apache/2.4.41 (Ubuntu) Server at my-server.example.com Port 9091</address></body></html>",
            errorStatus: 401,
            errorBody: "<html><body><h1>401 Unauthorized</h1></body></html>",
          }));
        },
      },
    ];

    const pro: OptionProps[] = [
      {
        id: "pro-override",
        left: "star",
        label: "Pro Override",
        value: devOverride ? "On" : "Off",
        variant: "compact",
        onPress: () => setDevOverride(!devOverride),
      },
    ];

    const servers: OptionProps[] = [
      {
        id: "mock",
        left: "radio",
        label: "Mock Server",
        variant: "compact",
        onPress: () => {
          const now = Date.now();
          const id = generateServerId();
          store({
            servers: [{ id, name: "app", url: "app-testing-url", type: "transmission" as const, createdAt: now, updatedAt: now }],
            activeServerId: id,
          });
        },
      },
      {
        id: "local-transmission",
        left: "hard-drive",
        label: "Local Transmission",
        variant: "compact",
        onPress: () => {
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
        },
      },
      {
        id: "local-qbittorrent",
        left: "hard-drive",
        label: "Local qBittorrent",
        variant: "compact",
        onPress: () => {
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
        },
      },
    ];

    const appIdSection: OptionProps[] = [
      {
        id: "regenerate-appid",
        left: "refresh-cw",
        label: "Regenerate",
        variant: "compact",
        onPress: () => setAppId(generateAppId()),
      },
    ];

    return [
      { key: "navigation", title: "Navigation", data: navigation },
      { key: "actions", title: "Actions", data: actions },
      { key: "pro", title: "Pro", data: pro },
      { key: "servers", title: "Servers", data: servers },
      { key: "appid", title: "App ID", data: appIdSection },
    ];
  }, [devOverride, router, setDevOverride, store]);

  return (
    <Screen style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id ?? item.label}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        renderSectionHeader={({ section }) => (
          <>
            {section.key === "appid" && (
              <View style={styles.appIdContainer}>
                <SettingsSectionTitle
                  title={section.title}
                  variant="settings"
                  first={false}
                />
                <Text selectable style={styles.appId}>{appId}</Text>
              </View>
            )}
            {section.key !== "appid" && (
              <SettingsSectionTitle
                title={section.title}
                variant="settings"
                first={section.key === sections[0]?.key}
              />
            )}
          </>
        )}
        renderItem={({ item, index, section }) => {
          const isLast = index === section.data.length - 1;
          return (
            <View style={[styles.rowContainer, isLast && styles.rowLast]}>
              <Option {...item} />
            </View>
          );
        }}
        ListFooterComponent={<StorageInspector />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 8,
  },
  content: {
    paddingBottom: 24,
  },
  rowContainer: {
    marginBottom: 8,
  },
  rowLast: {
    marginBottom: 12,
  },
  appIdContainer: {
    marginBottom: 8,
  },
  appId: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  storageRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  storageKey: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  storageValue: {
    fontFamily: "RobotoMono-Regular",
    fontSize: 11,
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 13,
  },
  clearAll: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
});
