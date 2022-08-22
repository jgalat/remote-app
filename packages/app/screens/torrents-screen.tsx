import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useLinkTo, useNavigation } from "@react-navigation/native";
import BottomSheet from "@gorhom/bottom-sheet";

import { useServer } from "../hooks/use-settings";
import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";
import Button from "../components/button";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import TorrentItem from "../components/torrent-item";
import ErrorMessage from "../components/error-message";
import SheetMenu from "../components/sheet-menu";
import { useTheme } from "../hooks/use-theme-color";
import { useSession, useTorrents } from "../hooks/use-transmission";

export default function TorrentsScreen() {
  const linkTo = useLinkTo();
  const navigation = useNavigation();
  const server = useServer();
  const { text, lightGray } = useTheme();
  const { data: session } = useSession();
  const { data: torrents, mutate, error } = useTorrents();
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const addTorrentRef = React.useRef<BottomSheet>(null)

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
          {!!session ? (
            <ActionIcon
              onPress={() => addTorrentRef.current?.expand()}
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
  }, [linkTo, text, session, addTorrentRef]);

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
        renderItem={({ item }) => <TorrentItem torrent={item} />}
        keyExtractor={({ id }) => id.toString()}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: lightGray }]} />
        )}
        onRefresh={refresh}
        refreshing={refreshing}
      />
      <SheetMenu
        innerRef={addTorrentRef}
        title="Add a torrent"
        options={[
          {
            label: "File",
            left: "file",
            onPress: () => linkTo("/add/file")
          },
          {
            label: "Magnet URL",
            left: "link",
            onPress: () => linkTo("/add/magnet"),
          },
        ]}
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
