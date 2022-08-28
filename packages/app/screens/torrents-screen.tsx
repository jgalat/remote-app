import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import { Torrent } from "@remote-app/transmission-client";

import { useServer, useListing } from "../hooks/use-settings";
import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";
import Button from "../components/button";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import TorrentItem from "../components/torrent-item";
import ErrorMessage from "../components/error-message";
import { useTheme } from "../hooks/use-theme-color";
import { useSession, useTorrents } from "../hooks/use-transmission";
import {
  useAddTorrentSheet,
  useFilterSheet,
  useSortBySheet,
  useTorrentActionsSheet,
} from "../hooks/use-action-sheet";
import compare from "../utils/sort";
import predicate from "../utils/filter";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const { sort, direction, filter } = useListing();
  const { data: session } = useSession();
  const { data: torrents, mutate, error } = useTorrents();
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const { text, lightGray } = useTheme();
  const addTorrentSheet = useAddTorrentSheet();
  const torrentActionsSheet = useTorrentActionsSheet();
  const sortBySheet = useSortBySheet();
  const filterSheet = useFilterSheet();

  React.useLayoutEffect(() => {
    if (!server || server.name === "") {
      navigation.setOptions({ title: "remote" });
      return;
    }
    navigation.setOptions({ title: server.name });
  }, [server, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ActionList>
          {!!session
            ? [
                <ActionIcon
                  key="add"
                  onPress={() => addTorrentSheet()}
                  name="plus"
                  size={24}
                  color={text}
                />,
                <ActionIcon
                  key="sort"
                  onPress={() => sortBySheet()}
                  name="align-left"
                  size={24}
                  color={text}
                />,
                <ActionIcon
                  key="filter"
                  onPress={() => filterSheet()}
                  name="filter"
                  size={24}
                  color={text}
                />,
              ]
            : null}
          <ActionIcon
            onPress={() => linkTo("/settings")}
            name="settings"
            size={24}
            color={text}
          />
        </ActionList>
      ),
    });
  }, [linkTo, text, session, addTorrentSheet, sortBySheet]);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    await mutate();
    setRefreshing(false);
  }, [mutate, setRefreshing]);

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
    return (
      <Screen style={styles.message}>
        <ErrorMessage error={error} />
      </Screen>
    );
  }

  if (!torrents) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>Retrieving...</Text>
      </Screen>
    );
  }

  if (torrents.length === 0) {
    return (
      <Screen style={styles.message}>
        <Text style={styles.title}>No torrents found :(</Text>
        <Button title="Add a torrent" onPress={() => addTorrentSheet()} />
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
        renderItem={({ item }) => (
          <TorrentItem
            onPress={() => torrentActionsSheet(item)}
            torrent={item}
          />
        )}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: lightGray }]} />
        )}
        onRefresh={refresh}
        refreshing={refreshing}
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
  separator: {
    marginVertical: 16,
    height: 2,
    width: "100%",
  },
});
