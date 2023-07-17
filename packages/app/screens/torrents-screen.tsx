import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { Torrent, TorrentStatus } from "@remote-app/transmission-client";

import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";
import Button from "../components/button";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import TorrentItem from "../components/torrent-item";
import Stats from "../components/stats";
import Checkbox from "../components/checkbox";
import { useTheme } from "../hooks/use-theme-color";
import {
  useSession,
  useTorrentActions,
  useTorrents,
} from "../hooks/use-transmission";
import { useServer, useListing } from "../hooks/use-settings";
import {
  useAddTorrentSheet,
  useFilterSheet,
  useSortBySheet,
  useTorrentActionsSheet,
} from "../hooks/use-action-sheet";
import useTorrentSelection from "../hooks/use-torrent-selection";
import compare from "../utils/sort";
import predicate from "../utils/filter";
import { NetworkErrorScreen, LoadingScreen } from "./utils";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const { sort, direction, filter } = useListing();
  const { data: session } = useSession();
  const { data: torrents, refetch, error, isLoading } = useTorrents();
  const [refreshing, setRefreshing] = React.useState(false);
  const { lightGray } = useTheme();
  const { start, stop } = useTorrentActions();
  const addTorrentSheet = useAddTorrentSheet();
  const torrentActionsSheet = useTorrentActionsSheet();
  const sortBySheet = useSortBySheet();
  const filterSheet = useFilterSheet();

  const {
    active: activeSelection,
    selection,
    toggle,
    clear,
  } = useTorrentSelection();

  React.useLayoutEffect(() => {
    const title = !server || server.name === "" ? "remote" : server.name;
    navigation.setOptions({
      title: activeSelection ? "" : title,
      headerLeft: () =>
        activeSelection ? (
          <ActionIcon
            name="arrow-left"
            onPress={() => clear()}
            style={{ paddingLeft: 0 }}
          />
        ) : null,
      headerRight: () => {
        if (activeSelection && torrents) {
          return (
            <ActionList>
              <ActionIcon
                onPress={() =>
                  torrentActionsSheet({
                    torrents: torrents.filter((t) => selection.has(t.id)),
                  })
                }
                name="more-vertical"
              />
            </ActionList>
          );
        }

        const actions = session
          ? [
              <ActionIcon key="add" onPress={addTorrentSheet} name="plus" />,
              <ActionIcon key="sort" onPress={sortBySheet} name="align-left" />,
              <ActionIcon key="filter" onPress={filterSheet} name="filter" />,
            ]
          : [];

        return (
          <ActionList>
            {actions}
            <ActionIcon onPress={() => linkTo("/settings")} name="settings" />
          </ActionList>
        );
      },
    });
  }, [
    activeSelection,
    addTorrentSheet,
    clear,
    filterSheet,
    linkTo,
    navigation,
    selection,
    server,
    session,
    sortBySheet,
    torrentActionsSheet,
    torrents,
  ]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (!server) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>No connection found :(</Text>
        <Button
          title="Setup connection"
          onPress={() => linkTo("/settings/connection")}
        />
      </Screen>
    );
  }

  if (error) {
    return <NetworkErrorScreen error={error} />;
  }

  if (isLoading || !torrents) {
    return <LoadingScreen />;
  }

  if (torrents.length === 0) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>No torrents found :(</Text>
        <Button title="Add a torrent" onPress={addTorrentSheet} />
      </Screen>
    );
  }

  const render: Torrent[] = [...torrents]
    .sort(compare(direction, sort))
    .filter(predicate(filter));

  return (
    <Screen>
      <FlatList
        fadingEdgeLength={64}
        data={render}
        renderItem={({ item: torrent }) => (
          <TorrentItem
            onPress={() =>
              activeSelection
                ? toggle(torrent.id)
                : torrentActionsSheet({ torrents: [torrent] })
            }
            onLongPress={() => toggle(torrent.id)}
            torrent={torrent}
            left={
              activeSelection ? (
                <Checkbox
                  value={selection.has(torrent.id)}
                  onPress={() => toggle(torrent.id)}
                />
              ) : (
                <ActionIcon
                  name={
                    torrent.status === TorrentStatus.STOPPED ? "play" : "pause"
                  }
                  onPress={() =>
                    torrent.status === TorrentStatus.STOPPED
                      ? start.mutate({ ids: torrent.id })
                      : stop.mutate({ ids: torrent.id })
                  }
                />
              )
            }
          />
        )}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: lightGray }]} />
        )}
        onRefresh={refresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <Text style={styles.empty}>Nothing to see here...</Text>
        }
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
  empty: {
    alignSelf: "center",
    marginTop: 48,
    fontSize: 16,
    fontFamily: "RobotoMono-Medium",
  },
  separator: {
    marginVertical: 16,
    height: 2,
    width: "100%",
  },
});
