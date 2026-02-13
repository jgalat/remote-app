import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrent } from "~/hooks/transmission";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import Separator from "~/components/separator";
import KeyValue from "~/components/key-value";

function na(count: number) {
  return count > 0 ? count : "N/A";
}

export default function TrackersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={styles.container}>
      <FlatList
        // fadingEdgeLength={64}
        data={torrents[0].trackerStats}
        renderItem={({ item: tracker }) => {
          const url = new URL(tracker.announce);
          const lastAnnounce =
            tracker.lastAnnounceTime > 0
              ? new Date(tracker.lastAnnounceTime * 1_000).toLocaleString()
              : "N/A";
          const nextAnnounce =
            tracker.nextAnnounceTime > 0
              ? new Date(tracker.nextAnnounceTime * 1_000).toLocaleString()
              : "N/A";

          const lastScrape =
            tracker.lastScrapeTime > 0
              ? new Date(tracker.lastScrapeTime * 1_000).toLocaleString()
              : "N/A";
          const nextScrape =
            tracker.lastScrapeTime > 0
              ? new Date(tracker.nextScrapeTime * 1_000).toLocaleString()
              : "N/A";

          return (
            <View style={{ gap: 8 }}>
              <Text numberOfLines={1} style={styles.title}>
                Tier {tracker.tier + 1} - {url.host}
              </Text>
              <View>
                <KeyValue
                  style={styles.kv}
                  field="Last Announce"
                  value={lastAnnounce}
                />
                <KeyValue
                  style={styles.kv}
                  field="Result"
                  value={
                    tracker.lastAnnounceSucceeded
                      ? `${na(tracker.lastAnnouncePeerCount)} peers`
                      : tracker.lastAnnounceResult
                  }
                />
                <KeyValue
                  style={styles.kv}
                  field="Next Announce"
                  value={nextAnnounce}
                />
              </View>
              <View>
                <KeyValue
                  style={styles.kv}
                  field="Last Scrape"
                  value={lastScrape}
                />
                <KeyValue
                  style={styles.kv}
                  field="Result"
                  value={
                    tracker.lastScrapeSucceeded
                      ? `Success`
                      : tracker.lastScrapeResult
                  }
                />
                <KeyValue
                  style={styles.kv}
                  field="Next Scrape"
                  value={nextScrape}
                />
              </View>
              <View>
                <KeyValue
                  style={styles.kv}
                  field="Seeders"
                  value={na(tracker.seederCount)}
                />
                <KeyValue
                  style={styles.kv}
                  field="Leechers"
                  value={na(tracker.leecherCount)}
                />
                <KeyValue
                  style={styles.kv}
                  field="Downloaded"
                  value={na(tracker.downloadCount)}
                />
              </View>
            </View>
          );
        }}
        keyExtractor={({ announce, scrape }) => announce + scrape}
        ItemSeparatorComponent={Separator}
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
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
