import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrentTrackers } from "~/hooks/torrent";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import Separator from "~/components/separator";
import KeyValue from "~/components/key-value";
import type { TrackerStats } from "~/client";

function na(count: number) {
  return count > 0 ? count : "N/A";
}

const ROW_STYLE = { gap: 8 } as const;

function TrackerRow({ tracker }: { tracker: TrackerStats }) {
  // Tracker URLs can be udp://, http://, https://, ws[s]://. URL()
  // handles them all, but it throws on empty/garbage strings — fall
  // back to the raw string instead of crashing the row.
  let host = tracker.announce || "(unknown)";
  try {
    host = new URL(tracker.announce).host || host;
  } catch {
    // keep fallback
  }
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
    <View style={ROW_STYLE}>
      <Text numberOfLines={1} style={styles.title}>
        Tier {tracker.tier + 1} - {host}
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
}

const renderTrackerItem = ({ item }: { item: TrackerStats }) => (
  <TrackerRow tracker={item} />
);

export default function TrackersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrent, error, isLoading, refetch } = useTorrentTrackers(id);
  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrent) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={styles.container}>
      <FlatList
        data={torrent.trackerStats}
        renderItem={renderTrackerItem}
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
