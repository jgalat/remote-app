import * as React from "react";
import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import type { TextInput as RNTextInput } from "react-native";
import Pressable from "~/components/pressable";
import { useRouter, useNavigation } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import { useQueryClient } from "@tanstack/react-query";
import { SheetManager } from "react-native-actions-sheet";

import Text from "~/components/text";
import TextInput from "~/components/text-input";
import View from "~/components/view";
import Screen from "~/components/screen";
import Button from "~/components/button";
import ActionList from "~/components/action-list";
import ActionIcon from "~/components/action-icon";
import TorrentItem from "~/components/torrent-item";
import Separator from "~/components/separator";
import Stats from "~/components/stats";
import CombinedStats from "~/components/combined-stats";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import {
  useAllSessions,
  useAllTorrents,
  useTorrentActions,
  useTorrents,
  type ServerTorrent,
} from "~/hooks/torrent";
import {
  useServer,
  useAllDirectories,
  useListing,
  useServers,
  useSearchConfig,
  useServersStore,
} from "~/hooks/use-settings";
import {
  useListingSheet,
  useTorrentActionsSheet,
  useServerSelectorSheet,
} from "~/hooks/use-action-sheet";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import { usePro } from "@remote-app/pro";
import compare from "~/utils/sort";
import predicate, { pathPredicate, searchPredicate } from "~/utils/filter";
import { aggregateListingDirectories } from "~/utils/listing-directories";
import { createClient } from "~/client";
import { queryKeys } from "~/hooks/torrent/query-keys";
import { SELECT_SHEET_ID } from "~/sheets/ids";
import type { SelectOption } from "~/sheets/select";
import { useTheme } from "~/hooks/use-theme-color";

type HeaderActionsProps = {
  onAdd: () => void;
  onSearch: () => void;
  onIndexerSearch?: () => void;
  indexerSearchLabel?: string;
  onListing: () => void;
  onSettings: () => void;
};

function HeaderActions({
  onAdd,
  onSearch,
  onIndexerSearch,
  indexerSearchLabel,
  onListing,
  onSettings,
}: HeaderActionsProps) {
  const openMore = React.useCallback(() => {
    const options: SelectOption[] = [
      ...(onIndexerSearch
        ? [
            {
              id: "indexer-search",
              label: indexerSearchLabel ?? "Search indexers",
              left: "globe" as const,
              value: "indexer-search",
            },
          ]
        : []),
      {
        id: "settings",
        label: "Settings",
        left: "settings" as const,
        value: "settings",
      },
    ];

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        options,
        onSelect: (value) => {
          if (value === "indexer-search") {
            onIndexerSearch?.();
            return;
          }
          onSettings();
        },
      },
    });
  }, [indexerSearchLabel, onIndexerSearch, onSettings]);

  return (
    <ActionList spacing={2}>
      <ActionIcon
        name="plus"
        onPress={onAdd}
        accessibilityLabel="Add torrent"
      />
      <ActionIcon
        name="search"
        onPress={onSearch}
        accessibilityLabel="Search torrents"
      />
      <ActionIcon
        name="sliders"
        onPress={onListing}
        accessibilityLabel="Sort and filter torrents"
      />
      {onIndexerSearch ? (
        <ActionIcon
          name="more-vertical"
          onPress={openMore}
          accessibilityLabel="More actions"
          style={{ paddingRight: 0 }}
        />
      ) : (
        <ActionIcon
          name="settings"
          onPress={onSettings}
          accessibilityLabel="Settings"
          style={{ paddingRight: 0 }}
        />
      )}
    </ActionList>
  );
}

function SearchInput({ onSubmit }: { onSubmit: (query: string) => void }) {
  const [text, setText] = React.useState("");
  const ref = React.useRef<RNTextInput>(null);

  React.useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 100);
    return () => clearTimeout(id);
  }, []);

  return (
    <TextInput
      ref={ref}
      value={text}
      onChangeText={setText}
      onSubmitEditing={() => onSubmit(text)}
      placeholder="Search torrents..."
      returnKeyType="search"
      style={styles.searchInput}
      containerStyle={styles.searchContainer}
    />
  );
}

export default function TorrentsScreen() {
  const { serverScope } = useListing();
  const servers = useServers();
  const { isPro } = usePro();

  if (serverScope === "all" && isPro && servers.length > 1) {
    return <AllServersTorrentsScreen />;
  }

  return <ServerTorrentsScreen />;
}

function ServerTorrentsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const searchConfig = useSearchConfig();
  const server = useServer();
  const servers = useServers();
  const { sort, direction, filter, pathFilter } = useListing();
  const {
    data: torrents,
    refetch,
    error,
    isLoading,
  } = useTorrents({ stale: !isFocused });
  const [refreshing, setRefreshing] = React.useState(false);
  const { start, stop } = useTorrentActions();
  const torrentActionsSheet = useTorrentActionsSheet();
  const listingSheet = useListingSheet();
  const { available, isPro } = usePro();
  const serverSelectorSheet = useServerSelectorSheet();

  const {
    active: activeSelection,
    selection,
    select,
    toggle,
    clear,
  } = useTorrentSelection();

  const [searching, setSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const exitSearch = React.useCallback(() => {
    setSearching(false);
    setSearchQuery("");
  }, []);

  const openIndexerSearch = React.useCallback(() => {
    if (!isPro) {
      router.push("/paywall");
      return;
    }

    router.push(searchConfig ? "/search" : "/settings/search");
  }, [isPro, router, searchConfig]);

  const openSettings = React.useCallback(
    () => router.push("/settings"),
    [router],
  );

  const openAdd = React.useCallback(() => router.push("/add"), [router]);
  const indexerSearchLabel = searchConfig
    ? `Search ${searchConfig.type === "prowlarr" ? "Prowlarr" : "Jackett"}`
    : undefined;

  React.useEffect(() => {
    if (!searching) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitSearch();
      return true;
    });
    return () => sub.remove();
  }, [searching, exitSearch]);

  const resolvedPath = pathFilter || null;

  const render = React.useMemo(
    () =>
      torrents
        ? [...torrents]
            .sort(compare(direction, sort))
            .filter(predicate(filter))
            .filter(pathPredicate(resolvedPath))
            .filter(searchPredicate(searchQuery))
        : [],
    [torrents, direction, sort, filter, resolvedPath, searchQuery]
  );

  React.useEffect(() => {
    const title = !server || server.name === "" ? "Remote" : server.name;
    if (searching) {
      navigation.setOptions({
        headerTitle: () => <SearchInput onSubmit={setSearchQuery} />,
        headerLeft: () => (
          <ActionIcon
            name="arrow-left"
            onPress={exitSearch}
            style={{ paddingLeft: 0, paddingRight: 32 }}
          />
        ),
        headerRight: () => null,
      });
    } else {
      navigation.setOptions({
        headerTitle: () =>
          activeSelection ? (
            <Text style={styles.headerTitle}>{selection.size.toString()}</Text>
          ) : (
            <Pressable
              onPress={servers.length > 0 ? serverSelectorSheet : undefined}
              style={styles.headerTitleRow}
            >
              <Text
                style={[styles.headerTitle, { flexShrink: 1 }]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </Pressable>
          ),
        headerLeft: () =>
          activeSelection ? (
            <ActionIcon
              name="arrow-left"
              onPress={() => clear()}
              style={{ paddingLeft: 0, paddingRight: 32 }}
            />
          ) : null,
        headerRight: () => {
          if (activeSelection && torrents) {
            return (
              <ActionList>
                <ActionIcon
                  onPress={() => {
                    if (selection.size === 0) {
                      return;
                    }
                    select(...render.map((t) => t.id));
                  }}
                  name="list"
                />
                <ActionIcon
                  onPress={() => {
                    if (selection.size === 0) {
                      return;
                    }

                    torrentActionsSheet({
                      torrents: torrents.filter((t) => selection.has(t.id)),
                    });
                  }}
                  name="more-vertical"
                  accessibilityLabel="More torrent actions"
                />
              </ActionList>
            );
          }

          if (!torrents) return null;

          return (
            <HeaderActions
              onAdd={openAdd}
              onSearch={() => setSearching(true)}
              onIndexerSearch={
                available && searchConfig ? openIndexerSearch : undefined
              }
              indexerSearchLabel={indexerSearchLabel}
              onListing={listingSheet}
              onSettings={openSettings}
            />
          );
        },
      });
    }
  }, [
    router,
    activeSelection,
    clear,
    listingSheet,
    navigation,
    select,
    selection,
    server,
    servers,
    searchConfig,
    available,
    isPro,
    serverSelectorSheet,
    torrentActionsSheet,
    torrents,
    render,
    searching,
    exitSearch,
    openAdd,
    openIndexerSearch,
    openSettings,
    indexerSearchLabel,
  ]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const renderTorrentItem = React.useCallback(
    ({ item: torrent }: { item: (typeof render)[number] }) => (
      <TorrentItem
        torrent={torrent}
        activeSelection={activeSelection}
        selected={selection.has(torrent.id)}
        onToggle={toggle}
        onActions={torrentActionsSheet}
        onStart={start.mutate}
        onStop={stop.mutate}
      />
    ),
    [activeSelection, selection, toggle, torrentActionsSheet, start.mutate, stop.mutate]
  );

  if (servers.length === 0) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>No connection found</Text>
        <Button
          title="Setup connection"
          onPress={() => router.push("/settings/connection")}
        />
      </Screen>
    );
  }

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents) {
    return <LoadingScreen />;
  }

  if (torrents.length === 0) {
    return (
      <Screen>
        <FlatList
          data={[]}
          renderItem={() => null}
          contentContainerStyle={styles.emptyList}
          ListEmptyComponent={
            <View style={styles.message}>
              <Text style={styles.title}>No torrents found</Text>
              <Button title="Add a torrent" onPress={() => router.push("/add")} />
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
        />
        <Stats />
      </Screen>
    );
  }

  return (
    <Screen style={{ paddingTop: 16 }}>
      <FlatList
        keyboardDismissMode="on-drag"
        data={render}
        renderItem={renderTorrentItem}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.noResults}>No results</Text>
          </View>
        }
        contentContainerStyle={render.length === 0 && styles.emptyList}
        onRefresh={refresh}
        refreshing={refreshing}
      />
      <Stats />
    </Screen>
  );
}

function AllServersTorrentsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const servers = useServers();
  const savedDirectories = useAllDirectories();
  const searchConfig = useSearchConfig();
  const { sort, direction, filter, pathFilter } = useListing();
  const { store } = useServersStore();
  const { available } = usePro();
  const { gray } = useTheme();
  const serverSelectorSheet = useServerSelectorSheet();
  const torrentActionsSheet = useTorrentActionsSheet();
  const { data, errors, isLoading, refetch } = useAllTorrents({
    stale: !isFocused,
  });
  const sessions = useAllSessions({ stale: !isFocused });
  const listingDirectories = React.useMemo(
    () =>
      aggregateListingDirectories(
        sessions.map((session) => session["download-dir"]),
        savedDirectories,
        data.map(({ torrent }) => torrent.downloadDir),
      ),
    [sessions, savedDirectories, data],
  );
  const listingPayload = React.useMemo(
    () => ({
      torrents: data.map(({ torrent }) => torrent),
      directories: listingDirectories,
    }),
    [data, listingDirectories],
  );
  const listingSheet = useListingSheet(listingPayload);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const exitSearch = React.useCallback(() => {
    setSearching(false);
    setSearchQuery("");
  }, []);

  const openIndexerSearch = React.useCallback(
    () => router.push(searchConfig ? "/search" : "/settings/search"),
    [router, searchConfig],
  );

  const openSettings = React.useCallback(
    () => router.push("/settings"),
    [router],
  );
  const indexerSearchLabel = searchConfig
    ? `Search ${searchConfig.type === "prowlarr" ? "Prowlarr" : "Jackett"}`
    : undefined;

  const openAdd = React.useCallback(() => router.push("/add"), [router]);

  React.useEffect(() => {
    if (!searching) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitSearch();
      return true;
    });
    return () => sub.remove();
  }, [searching, exitSearch]);

  const render = React.useMemo(
    () =>
      [...data]
        .sort((a, b) => compare(direction, sort)(a.torrent, b.torrent))
        .filter(({ torrent }) => predicate(filter)(torrent))
        .filter(({ torrent }) => pathPredicate(pathFilter || null)(torrent))
        .filter(({ torrent }) => searchPredicate(searchQuery)(torrent)),
    [data, direction, sort, filter, pathFilter, searchQuery],
  );

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const runAction = React.useCallback(
    async (
      action: "start" | "stop",
      { server, torrent }: ServerTorrent,
    ) => {
      const client = createClient(server);
      try {
        if (action === "start") {
          await client.startTorrents([torrent.id]);
        } else {
          await client.stopTorrents([torrent.id]);
        }
        await queryClient.invalidateQueries({
          queryKey: queryKeys.torrents(server),
        });
      } catch {
        ToastAndroid.show(
          `Failed to ${action} on ${server.name}`,
          ToastAndroid.SHORT,
        );
      }
    },
    [queryClient],
  );

  const showActions = React.useCallback(
    ({ server, torrent }: ServerTorrent) => {
      store(
        { activeServerId: server.id },
        {
          onSettled: () => torrentActionsSheet({ torrents: [torrent] }),
        },
      );
    },
    [store, torrentActionsSheet],
  );

  React.useEffect(() => {
    if (searching) {
      navigation.setOptions({
        headerTitle: () => <SearchInput onSubmit={setSearchQuery} />,
        headerLeft: () => (
          <ActionIcon
            name="arrow-left"
            onPress={exitSearch}
            style={{ paddingLeft: 0, paddingRight: 32 }}
          />
        ),
        headerRight: () => null,
      });
      return;
    }

    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={serverSelectorSheet} style={styles.headerTitleRow}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            All servers
          </Text>
        </Pressable>
      ),
      headerLeft: () => null,
      headerRight: () => (
        <HeaderActions
          onAdd={openAdd}
          onSearch={() => setSearching(true)}
          onIndexerSearch={
            available && searchConfig ? openIndexerSearch : undefined
          }
          indexerSearchLabel={indexerSearchLabel}
          onListing={listingSheet}
          onSettings={openSettings}
        />
      ),
    });
  }, [
    available,
    exitSearch,
    listingSheet,
    navigation,
    router,
    searching,
    searchConfig,
    serverSelectorSheet,
    openAdd,
    openIndexerSearch,
    openSettings,
    indexerSearchLabel,
  ]);

  const renderTorrentItem = React.useCallback(
    ({ item }: { item: ServerTorrent }) => (
      <TorrentItem
        torrent={item.torrent}
        badge={item.server.name}
        onActions={() => showActions(item)}
        onStart={() => runAction("start", item)}
        onStop={() => runAction("stop", item)}
      />
    ),
    [runAction, showActions],
  );

  if (servers.length === 0) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>No connection found</Text>
        <Button
          title="Setup connection"
          onPress={() => router.push("/settings/connection")}
        />
      </Screen>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={{ paddingTop: 16 }}>
      <FlatList
        keyboardDismissMode="on-drag"
        data={render}
        renderItem={renderTorrentItem}
        keyExtractor={({ server, torrent }) =>
          `${server.id}:${torrent.id.toString()}`
        }
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          errors.length > 0 ? (
            <View style={styles.partialError}>
              <Text style={styles.partialErrorTitle}>
                {errors.length} {errors.length === 1 ? "server" : "servers"} unavailable
              </Text>
              <Text color={gray} style={styles.partialErrorDetail}>
                {errors.map(({ server }) => server.name).join(", ")}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={data.length === 0 ? styles.title : styles.noResults}>
              {data.length === 0 ? "No torrents found" : "No results"}
            </Text>
          </View>
        }
        contentContainerStyle={render.length === 0 && styles.emptyList}
        onRefresh={refresh}
        refreshing={refreshing}
      />
      <CombinedStats
        torrents={data.map(({ torrent }) => torrent)}
        servers={servers}
        connectedServers={servers.length - errors.length}
        totalServers={servers.length}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "RobotoMono-Medium",
    marginBottom: 24,
  },
  noResults: {
    fontSize: 16,
    fontFamily: "RobotoMono-Medium",
  },
  emptyList: {
    flexGrow: 1,
  },
  headerTitle: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 18,
  },
  headerTitleRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    justifyContent: "center",
  },
  searchInput: {
    fontSize: 18,
  },
  partialError: {
    borderWidth: 1,
    borderColor: "#c0392b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  partialErrorTitle: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 13,
  },
  partialErrorDetail: {
    fontSize: 12,
    marginTop: 4,
  },
});
