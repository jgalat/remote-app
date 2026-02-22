import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrent } from "~/hooks/torrent";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import PeerItem from "~/components/peer-item";
import Separator from "~/components/separator";

export default function PeersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrent, error, isLoading, refetch } = useTorrent(id);
  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrent) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={styles.container}>
      <FlatList
        data={torrent.peers}
        renderItem={({ item: peer }) => <PeerItem data={peer} />}
        keyExtractor={({ address, port }) => `${address}:${port}`}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>No peers found</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 16,
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
