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
import useThemeColor from "../hooks/use-theme-color";
import { useTorrents } from "../hooks/use-transmission";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const text = useThemeColor("text");
  const err = useThemeColor("error");
  const { data: torrents, error } = useTorrents();

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
          {!!server ? (
            <ActionIcon
              onPress={() => linkTo("/add")}
              name="plus"
              size={24}
              color={text}
            />
          ) : null}
          <ActionIcon
            onPress={() => linkTo("/settings")}
            name="settings"
            size={24}
            color={text}
          />
        </ActionList>
      ),
    });
  }, [linkTo, text, server]);

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
        <Text style={[styles.title, { color: err }]}>
          Failed to connect to server
        </Text>
        {error && (
          <Text style={[styles.title, { color: err }]}>{error.message}</Text>
        )}
      </Screen>
    );
  }

  if (!torrents) {
    return (
      <Screen style={styles.message}>
        <Text style={[styles.title]}>Retrieving...</Text>
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
        renderItem={({ item }) => <TorrentItem torrent={item} />}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: text }]} />
        )}
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
    fontWeight: "500",
    marginBottom: 24,
  },
  separator: {
    marginVertical: 16,
    height: 2,
    width: "100%",
  },
});
