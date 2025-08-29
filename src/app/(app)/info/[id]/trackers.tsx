import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrent } from "~/hooks/use-transmission";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import { useTheme } from "~/hooks/use-theme-color";
import KeyValue from "~/components/key-value";

export default function TorrentDetailsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  const { lightGray } = useTheme();

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  const trackers = [
    {
      announce: "https://tracker1.example.org:443/announce",
      id: 0,
      scrape: "https://tracker1.example.org:443/scrape",
      tier: 0,
    },
    {
      announce: "udp://tracker2.example.net:6969/announce",
      id: 1,
      scrape: "udp://tracker2.example.net:6969/scrape",
      tier: 0,
    },
    {
      announce: "https://tracker3.example.com/announce",
      id: 2,
      scrape: "https://tracker3.example.com/scrape",
      tier: 1,
    },
  ];

  return (
    <Screen style={styles.container}>
      <FlatList
        fadingEdgeLength={64}
        data={trackers}
        renderItem={({ item: tracker }) => (
          <View>
            <Text style={styles.title}>Tracker #{tracker.id}</Text>
            <KeyValue
              style={styles.kv}
              field="Announce"
              value={tracker.announce}
            />
            <KeyValue style={styles.kv} field="Scrape" value={tracker.scrape} />
          </View>
        )}
        keyExtractor={({ announce }) => announce}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: lightGray }]} />
        )}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>No trackers found</Text>
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
  kv: {
    marginBottom: 0,
  },
  separator: {
    marginVertical: 16,
    height: 1,
    width: "100%",
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
