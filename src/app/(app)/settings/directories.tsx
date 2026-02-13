import * as React from "react";
import { StyleSheet, FlatList, BackHandler } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SheetManager } from "react-native-actions-sheet";
import * as Haptics from "expo-haptics";

import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Button from "~/components/button";
import Screen from "~/components/screen";
import { LoadingScreen, NetworkErrorScreen } from "~/components/utility-screens";
import {
  useServers,
  useActiveServerId,
  useDirectoriesStore,
} from "~/hooks/use-settings";
import { useServerSession } from "~/hooks/transmission";
import { useTheme } from "~/hooks/use-theme-color";
import SelectSheet from "~/sheets/select";
import type { SelectOption } from "~/sheets/select";
import type { Server } from "~/store/settings";

type DirectoryEntry = {
  path: string;
  isDefault: boolean;
  isGlobal: boolean;
};

function Separator() {
  const { lightGray } = useTheme();
  return <View style={[styles.separator, { backgroundColor: lightGray }]} />;
}

function DirectoryRow({
  entry,
  selected,
  selectionActive,
  onPress,
  onLongPress,
}: {
  entry: DirectoryEntry;
  selected: boolean;
  selectionActive: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { text, gray, tint } = useTheme();

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      onLongPress={
        entry.isDefault
          ? undefined
          : async () => {
              await Haptics.performAndroidHapticsAsync(
                Haptics.AndroidHaptics.Long_Press
              );
              onLongPress();
            }
      }
    >
      {selectionActive ? (
        entry.isDefault ? (
          <Feather name="folder" size={20} color={text} />
        ) : (
          <Feather
            name={selected ? "check-square" : "square"}
            size={20}
            color={selected ? tint : text}
          />
        )
      ) : (
        <Feather name="folder" size={20} color={text} />
      )}
      <View style={styles.rowInfo}>
        <Text style={styles.rowPath} numberOfLines={1}>
          {entry.path}
        </Text>
        <Text style={[styles.rowTag, { color: gray }]}>
          {entry.isDefault ? "default" : entry.isGlobal ? "global" : "server"}
        </Text>
      </View>
      {!selectionActive && (
        <Feather name="chevron-right" size={20} color={text} />
      )}
    </Pressable>
  );
}

function DirectoriesList({ server }: { server: Server }) {
  const router = useRouter();
  const { red } = useTheme();
  const { data: session, isLoading, error, refetch } = useServerSession(server);
  const { directories, store } = useDirectoriesStore();

  const globalDirs = directories.global;
  const serverDirs = React.useMemo(
    () => directories.servers[server.id] ?? [],
    [directories.servers, server.id]
  );

  const entries = React.useMemo<DirectoryEntry[]>(() => {
    const result: DirectoryEntry[] = [];
    const defaultDir = session?.["download-dir"];
    const seen = new Set<string>();

    if (defaultDir) {
      result.push({ path: defaultDir, isDefault: true, isGlobal: false });
      seen.add(defaultDir);
    }

    for (const dir of globalDirs) {
      if (seen.has(dir)) continue;
      result.push({ path: dir, isDefault: false, isGlobal: true });
      seen.add(dir);
    }

    for (const dir of serverDirs) {
      if (seen.has(dir)) continue;
      result.push({ path: dir, isDefault: false, isGlobal: false });
      seen.add(dir);
    }

    return result;
  }, [session, globalDirs, serverDirs]);

  const [selectedPaths, setSelectedPaths] = React.useState<Set<string>>(new Set());
  const selectionActive = selectedPaths.size > 0;

  React.useEffect(() => {
    if (!selectionActive) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setSelectedPaths(new Set());
      return true;
    });
    return () => sub.remove();
  }, [selectionActive]);

  const toggleSelection = React.useCallback((path: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const clearSelection = React.useCallback(() => {
    setSelectedPaths(new Set());
  }, []);

  const onDeleteSelected = React.useCallback(() => {
    if (selectedPaths.size === 0) return;

    store({
      global: globalDirs.filter((d) => !selectedPaths.has(d)),
      servers: {
        ...directories.servers,
        [server.id]: serverDirs.filter((d) => !selectedPaths.has(d)),
      },
    });

    clearSelection();
  }, [selectedPaths, globalDirs, serverDirs, directories.servers, server.id, store, clearSelection]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !session) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <DirectoryRow
            entry={item}
            selected={selectedPaths.has(item.path)}
            selectionActive={selectionActive}
            onPress={() => {
              if (selectionActive) {
                if (!item.isDefault) toggleSelection(item.path);
                return;
              }
              router.push(
                `/settings/directory?serverId=${server.id}&path=${encodeURIComponent(item.path)}&isDefault=${item.isDefault}`
              );
            }}
            onLongPress={() => toggleSelection(item.path)}
          />
        )}
        ItemSeparatorComponent={Separator}
      />
      {selectionActive ? (
        <View style={styles.footer}>
          <Button
            title={`Delete Selected (${selectedPaths.size})`}
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
        <View style={styles.footer}>
          <Button
            title="Add Directory"
            onPress={() =>
              router.push(`/settings/directory?serverId=${server.id}`)
            }
          />
        </View>
      )}
    </Screen>
  );
}

export default function DirectoriesScreen() {
  const servers = useServers();
  const activeServerId = useActiveServerId();
  const { text } = useTheme();

  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    activeServerId ?? servers[0]?.id
  );

  const server = selectedId
    ? servers.find((s) => s.id === selectedId)
    : undefined;

  const onPickServer = React.useCallback(() => {
    const options: SelectOption[] = servers.map((s) => ({
      id: s.id,
      label: s.name,
      value: s.id,
      left: "server" as const,
      right: s.id === selectedId ? ("check" as const) : undefined,
    }));

    SheetManager.show(SelectSheet.sheetId, {
      payload: {
        title: "Select server",
        options,
        onSelect: (value) => setSelectedId(String(value)),
      },
    });
  }, [servers, selectedId]);

  if (servers.length === 0) {
    return (
      <Screen>
        <Text>No servers configured</Text>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {servers.length > 1 && (
        <Pressable style={styles.serverSelector} onPress={onPickServer}>
          <Feather name="server" size={16} color={text} />
          <Text style={styles.serverName}>{server?.name ?? "Select server"}</Text>
          <Feather name="chevron-down" size={16} color={text} />
        </Pressable>
      )}
      {server && <DirectoriesList server={server} />}
    </View>
  );
}

const styles = StyleSheet.create({
  serverSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serverName: {
    flex: 1,
    fontFamily: "RobotoMono-Medium",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  rowInfo: {
    flex: 1,
    marginLeft: 16,
  },
  rowPath: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
  },
  rowTag: {
    fontSize: 12,
    marginTop: 2,
  },
  separator: {
    height: 1,
    opacity: 0.2,
  },
  footer: {
    paddingVertical: 16,
  },
});
