import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import Pressable from "~/components/pressable";
import { useRouter, useNavigation } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

import Text from "~/components/text";
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
import { useTorrentActions, useTorrents } from "~/hooks/transmission";
import useSettings, { useServer, useListing, useServers } from "~/hooks/use-settings";
import {
  useFilterSheet,
  useSortBySheet,
  useTorrentActionsSheet,
  useServerSelectorSheet,
} from "~/hooks/use-action-sheet";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import { usePro } from "@remote-app/pro";
import { useTheme } from "~/hooks/use-theme-color";
import compare from "~/utils/sort";
import predicate from "~/utils/filter";

export default function TorrentsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { settings } = useSettings();
  const server = useServer();
  const servers = useServers();
  const { sort, direction, filter } = useListing();
  const { text: textColor } = useTheme();
  const {
    data: torrents,
    refetch,
    error,
    isLoading,
  } = useTorrents({ stale: !isFocused });
  const [refreshing, setRefreshing] = React.useState(false);
  const { start, stop } = useTorrentActions();
  const torrentActionsSheet = useTorrentActionsSheet();
  const sortBySheet = useSortBySheet();
  const { canUse, available } = usePro();
  const filterSheet = useFilterSheet();
  const serverSelectorSheet = useServerSelectorSheet();

  const {
    active: activeSelection,
    selection,
    select,
    toggle,
    clear,
  } = useTorrentSelection();

  React.useEffect(() => {
    const title = !server || server.name === "" ? "Remote" : server.name;
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

        const onSearch = () => {
          if (!canUse("search")) {
            router.push("/paywall");
          } else if (settings.searchConfig) {
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
              ...(available
                ? [<ActionIcon key="search" onPress={onSearch} name="search" />]
                : []),
              <ActionIcon key="sort" onPress={sortBySheet} name="align-left" />,
              <ActionIcon key="filter" onPress={filterSheet} name="filter" />,
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
  }, [
    router,
    activeSelection,
    clear,
    filterSheet,
    navigation,
    select,
    selection,
    server,
    servers,
    settings,
    available,
    canUse,
    serverSelectorSheet,
    sortBySheet,
    textColor,
    torrentActionsSheet,
    torrents,
  ]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const render = React.useMemo(
    () =>
      torrents
        ? [...torrents].sort(compare(direction, sort)).filter(predicate(filter))
        : [],
    [torrents, direction, sort, filter]
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
        data={render}
        renderItem={({ item: torrent }) => (
          <TorrentItem
            torrent={torrent}
            activeSelection={activeSelection}
            selected={selection.has(torrent.id)}
            onToggle={toggle}
            onActions={torrentActionsSheet}
            onStart={start.mutate}
            onStop={stop.mutate}
          />
        )}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={Separator}
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
  headerTitle: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});
