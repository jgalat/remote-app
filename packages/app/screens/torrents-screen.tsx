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
import { useSession, useTorrents } from "../hooks/use-transmission";
import useActionSheet, {
  useAddTorrentSheet,
  useTorrentActionsSheet,
} from "../hooks/use-action-sheet";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const actionSheet = useActionSheet();
  const { data: session } = useSession();
  const { data: torrents, mutate, error } = useTorrents();
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const { text, lightGray } = useTheme();
  const addTorrentSheet = useAddTorrentSheet();
  const torrentActionsSheet = useTorrentActionsSheet();

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
  }, [linkTo, text, session, addTorrentSheet]);

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

  return (
    <Screen>
      <FlatList
        fadingEdgeLength={64}
        data={torrents}
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
