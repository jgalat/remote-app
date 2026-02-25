import * as React from "react";
import { BackHandler, FlatList, StyleSheet } from "react-native";
import type { TextInput as RNTextInput } from "react-native";
import Pressable from "~/components/pressable";
import { useRouter, useNavigation } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

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
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import { useTorrentActions, useTorrents } from "~/hooks/torrent";
import { useServer, useListing, useServers, useSearchConfig } from "~/hooks/use-settings";
import {
  useListingSheet,
  useTorrentActionsSheet,
  useServerSelectorSheet,
} from "~/hooks/use-action-sheet";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import { usePro } from "@remote-app/pro";
import compare from "~/utils/sort";
import predicate, { pathPredicate, searchPredicate } from "~/utils/filter";

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

  React.useEffect(() => {
    if (!searching) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      exitSearch();
      return true;
    });
    return () => sub.remove();
  }, [searching, exitSearch]);

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
                    select(...torrents.map((t) => t.id));
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
                />
              </ActionList>
            );
          }

          const onIndexerSearch = () => {
            if (!isPro) {
              router.push("/paywall");
              return;
            }

            if (searchConfig) {
              router.push("/search");
            } else {
              router.push("/settings/search");
            }
          };

          const actions = torrents
            ? [
                <ActionIcon
                  key="add"
                  onPress={() => router.push("/add")}
                  name="plus"
                />,
                <ActionIcon
                  key="local-search"
                  onPress={() => setSearching(true)}
                  name="search"
                />,
                ...(available
                  ? [
                      <ActionIcon
                        key="indexer-search"
                        onPress={onIndexerSearch}
                        name="globe"
                      />,
                    ]
                  : []),
                <ActionIcon
                  key="listing"
                  onPress={listingSheet}
                  name="sliders"
                />,
              ]
            : [];

          return (
            <ActionList spacing={4}>
              {actions}
              <ActionIcon
                style={{ paddingRight: 0 }}
                onPress={() => router.push("/settings")}
                name="settings"
              />
            </ActionList>
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
    searching,
    exitSearch,
  ]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
        <View style={styles.message}>
          <Text style={styles.title}>No torrents found</Text>
          <Button title="Add a torrent" onPress={() => router.push("/add")} />
        </View>
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
    fontSize: 20,
  },
  headerTitleRow: {
    flex: 1,
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
});
