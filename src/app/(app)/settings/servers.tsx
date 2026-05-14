import * as React from "react";
import { StyleSheet, FlatList, BackHandler, RefreshControl } from "react-native";
import ActivityIndicator from "~/components/activity-indicator";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import Screen from "~/components/screen";
import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Button from "~/components/button";
import {
  SettingsInsetDivider,
} from "~/components/settings";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore } from "~/hooks/use-settings";
import { usePro } from "@remote-app/pro";
import type { Server } from "~/store/settings";
import { useServerDeleteConfirmSheet } from "~/hooks/use-action-sheet";
import { useHealthPing, type HealthStatus } from "~/hooks/torrent";

function extractHostPort(server: Server): string {
  if (server.type === "local") return "libtorrent4j";
  try {
    const parsed = new URL(server.url);
    const port = parsed.port || (parsed.protocol === "https:" ? "443" : "80");
    return `${parsed.hostname}:${port}`;
  } catch {
    return server.url;
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
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}) {
  const { text, tint } = useTheme();
  const id = server.id;

  const handlePress = React.useCallback(() => onPress(id), [onPress, id]);
  const handleLongPress = React.useCallback(async () => {
    await Haptics.performAndroidHapticsAsync(
      Haptics.AndroidHaptics.Long_Press
    );
    onLongPress(id);
  }, [onLongPress, id]);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={styles.serverRow}
    >
      {selectionActive ? (
        <Feather
          name={selected ? "check-square" : "square"}
          size={20}
          color={selected ? tint : text}
        />
      ) : (
        <Feather
          name={server.type === "local" ? "hard-drive" : "server"}
          size={20}
          color={text}
        />
      )}
      <View style={styles.serverInfo}>
        <Text style={styles.serverName} numberOfLines={1}>
          {server.name}
        </Text>
        <Text style={styles.serverUrl} numberOfLines={1}>
          {extractHostPort(server)}
        </Text>
      </View>
      <HealthIndicator status={health} />
    </Pressable>
  );
}

export default function ServersScreen() {
  const { push } = useRouter();
  const { servers } = useServersStore();
  const { isPro, available } = usePro();
  const { gray, red, text } = useTheme();
  const { statuses: health, refetch, isFetching } = useHealthPing(servers);
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
    const label =
      ids.length === 1
        ? servers.find((s) => s.id === ids[0])?.name ?? "server"
        : `${ids.length} servers`;
    deleteSheet({ ids, label });
    clearSelection();
  }, [selectedIds, servers, deleteSheet, clearSelection]);

  const onAdd = React.useCallback(() => {
    if (servers.length === 0 || (available && isPro)) {
      push("/settings/connection");
    } else if (available) {
      push("/paywall");
    }
  }, [servers.length, available, isPro, push]);

  const onRowPress = React.useCallback(
    (id: string) => {
      if (selectionActive) {
        toggleSelection(id);
      } else {
        push(`/settings/connection?id=${id}`);
      }
    },
    [selectionActive, toggleSelection, push]
  );

  const onRowLongPress = React.useCallback(
    (id: string) => toggleSelection(id),
    [toggleSelection]
  );

  const renderItem = React.useCallback(
    ({ item: server }: { item: Server }) => (
      <ServerRow
        server={server}
        health={health[server.id] ?? "pending"}
        selected={selectedIds.has(server.id)}
        selectionActive={selectionActive}
        onPress={onRowPress}
        onLongPress={onRowLongPress}
      />
    ),
    [health, selectedIds, selectionActive, onRowPress, onRowLongPress]
  );

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
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={[text]}
              tintColor={text}
            />
          }
          renderItem={renderItem}
          ItemSeparatorComponent={() => <SettingsInsetDivider inset={12} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingVertical: 14,
    paddingHorizontal: 12,
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
  listContent: {
    paddingBottom: 12,
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
