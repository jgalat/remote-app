import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useLinkTo, useNavigation } from "@react-navigation/native";

import { useServer } from "../hooks/use-settings";
import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";
import Button from "../components/button";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import TorrentItem from "../components/torrent-item";
import ErrorMessage from "../components/error-message";
import { useTheme } from "../hooks/use-theme-color";
import {
  useSession,
  useTorrentActions,
  useTorrents,
} from "../hooks/use-transmission";
import useActionSheet from "../hooks/use-action-sheet";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const actionSheet = useActionSheet();
  const { data: session } = useSession();
  const { data: torrents, mutate, error } = useTorrents();
  const torrentActions = useTorrentActions();
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const { text, lightGray, red } = useTheme();

  const addTorrentMenu = React.useCallback(() => {
    actionSheet.show({
      title: "Add a Torrent",
      options: [
        {
          label: "File",
          left: "file",
          onPress: () => linkTo("/add/file"),
        },
        {
          label: "Magnet URL",
          left: "link",
          onPress: () => linkTo("/add/magnet"),
        },
      ],
    });
  }, [actionSheet, linkTo]);

  const sortByMenu = React.useCallback(() => {
    actionSheet.show({
      title: "Sort by",
      options: [
        {
          label: "Name",
          left: "chevron-right",
          onPress: () => {},
          right: "check",
        },
        {
          label: "Progress",
          left: "chevron-right",
          onPress: () => {},
        },
        {
          label: "Size",
          left: "chevron-right",
          onPress: () => {},
        },
        {
          label: "Status",
          left: "chevron-right",
          onPress: () => {},
        },
        {
          label: "Time remaining",
          left: "chevron-right",
          onPress: () => {},
        },
        {
          label: "Ratio",
          left: "chevron-right",
          onPress: () => {},
        },
      ],
    });
  }, [actionSheet, linkTo]);

  const confirmMenu = React.useCallback(
    (id: number) => {
      actionSheet.show({
        title: "Are you sure?",
        options: [
          {
            label: "Remove",
            left: "trash",
            color: red,
            onPress: () => torrentActions.remove(id),
          },
          {
            label: "Remove & Trash data",
            left: "trash-2",
            color: red,
            onPress: () =>
              torrentActions.remove(id, { "delete-local-data": true }),
          },
        ],
      });
    },
    [actionSheet, torrentActions]
  );

  const torrentMenu = React.useCallback(
    (id: number) => {
      let requiresConfirmation = false;
      actionSheet.show({
        title: "Action",
        options: [
          {
            label: "Start",
            left: "play",
            onPress: () => torrentActions.start(id),
          },
          {
            label: "Start now (no queue)",
            left: "play",
            onPress: () => torrentActions.startNow(id),
          },
          {
            label: "Stop",
            left: "pause",
            onPress: () => torrentActions.stop(id),
          },
          {
            label: "Verify",
            left: "check-circle",
            onPress: () => torrentActions.verify(id),
          },
          {
            label: "Reannounce",
            left: "radio",
            onPress: () => torrentActions.reannounce(id),
          },
          {
            label: "Remove",
            left: "trash",
            color: red,
            onPress: () => (requiresConfirmation = true),
          },
        ],
        onClose: () => {
          if (requiresConfirmation) {
            confirmMenu(id);
          }
        },
      });
    },
    [actionSheet, confirmMenu, torrentActions, red]
  );

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
                  onPress={() => addTorrentMenu()}
                  name="plus"
                  size={24}
                  color={text}
                />,
                <ActionIcon
                  key="sort"
                  onPress={() => sortByMenu()}
                  name="align-left"
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
  }, [linkTo, text, session, addTorrentMenu]);

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
        <Button title="Add a torrent" onPress={() => linkTo("/add")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={torrents}
        renderItem={({ item }) => (
          <TorrentItem onPress={() => torrentMenu(item.id)} torrent={item} />
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
    fontFamily: "roboto-mono_medium",
    marginBottom: 24,
  },
  separator: {
    marginVertical: 16,
    height: 2,
    width: "100%",
  },
});
