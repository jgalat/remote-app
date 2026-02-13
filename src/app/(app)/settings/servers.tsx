import * as React from "react";
import { StyleSheet, FlatList, BackHandler } from "react-native";
import ActivityIndicator from "~/components/activity-indicator";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Screen from "~/components/screen";
import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Button from "~/components/button";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore, useServer } from "~/hooks/use-settings";
import { usePro } from "@remote-app/pro";
import type { Server } from "~/store/settings";
import { useServerDeleteConfirmSheet } from "~/hooks/use-action-sheet";
import { useHealthPing, type HealthStatus } from "~/hooks/transmission";

function extractHostPort(url: string): string {
  try {
    const parsed = new URL(url);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return `${parsed.hostname}:${port}`;
  } catch {
    return url;
  }
}

function HealthIndicator({ status }: { status: HealthStatus }) {
  const { green, red, text } = useTheme();

  if (status === "pending") {
    return <ActivityIndicator size={20} color={text} />;
  }
  if (status === "ok") {
    return <Feather name="check" size={20} color={green} />;
  }
  return <Feather name="x" size={20} color={red} />;
}

function ServerRow({
  server,
  health,
  selected,
  selectionActive,
  onPress,
  onLongPress,
}: {
  server: Server;
  health: HealthStatus;
  selected: boolean;
  selectionActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { text, tint } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={async () => {
        await Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Long_Press
        );
        onLongPress();
      }}
      style={styles.serverRow}
    >
      {selectionActive ? (
        <Feather
          name={selected ? "check-square" : "square"}
          size={20}
          color={selected ? tint : text}
        />
      ) : (
        <Feather name="server" size={20} color={text} />
      )}
      <View style={styles.serverInfo}>
        <Text style={styles.serverName} numberOfLines={1}>
          {server.name}
        </Text>
        <Text style={styles.serverUrl} numberOfLines={1}>
          {extractHostPort(server.url)}
        </Text>
      </View>
      <HealthIndicator status={health} />
    </Pressable>
  );
}

export default function ServersScreen() {
  const router = useRouter();
  const { servers, store } = useServersStore();
  const { canUse, available } = usePro();
  const { gray, red } = useTheme();
  const active = useServer();
  const health = useHealthPing(servers);
  const deleteSheet = useServerDeleteConfirmSheet();

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const selectionActive = selectedIds.size > 0;

  React.useEffect(() => {
    if (!selectionActive) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSelectedIds(new Set());
      return true;
    });
    return () => sub.remove();
  }, [selectionActive]);

  const toggleSelection = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const onDeleteSelected = React.useCallback(() => {
    if (selectedIds.size === 0) return;

    const ids = [...selectedIds];
    if (ids.length === 1) {
      const server = servers.find((s) => s.id === ids[0]);
      if (server) {
        deleteSheet({ id: server.id, name: server.name });
      }
      clearSelection();
      return;
    }

    const remaining = servers.filter((s) => !selectedIds.has(s.id));
    const activeId = active?.id;
    const newActiveId = selectedIds.has(activeId ?? "")
      ? remaining[0]?.id
      : activeId;
    store({ servers: remaining, activeServerId: newActiveId });
    clearSelection();
  }, [selectedIds, servers, active, store, deleteSheet, clearSelection]);

  const onAdd = React.useCallback(() => {
    if (servers.length === 0 || (available && canUse("multi-server"))) {
      router.push("/settings/connection");
    } else if (available) {
      router.push("/paywall");
    }
  }, [servers.length, available, canUse, router]);

  return (
    <Screen>
      {servers.length === 0 ? (
        <View style={styles.empty}>
          <Text color={gray} style={styles.emptyText}>
            No servers configured
          </Text>
        </View>
      ) : (
        <FlatList
          data={servers}
          keyExtractor={(s) => s.id}
          renderItem={({ item: server }) => (
            <ServerRow
              server={server}
              health={health[server.id] ?? "pending"}
              selected={selectedIds.has(server.id)}
              selectionActive={selectionActive}
              onPress={() => {
                if (selectionActive) {
                  toggleSelection(server.id);
                } else {
                  router.push(`/settings/connection?id=${server.id}`);
                }
              }}
              onLongPress={() => toggleSelection(server.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
      {selectionActive ? (
        <View style={styles.footer}>
          <Button
            title={`Delete Selected (${selectedIds.size})`}
            onPress={onDeleteSelected}
            style={{ backgroundColor: red }}
          />
          <Button
            title="Cancel"
            variant="outline"
            onPress={clearSelection}
            style={{ marginTop: 8 }}
          />
        </View>
      ) : (
        (available || servers.length === 0) && (
          <View style={styles.footer}>
            <Button title="Add Server" onPress={onAdd} />
          </View>
        )
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  serverRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  serverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  serverName: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 17,
  },
  serverUrl: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.6,
  },
  separator: {
    height: 1,
    opacity: 0.2,
    backgroundColor: "#888",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  footer: {
    paddingVertical: 16,
  },
});
