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
import { useTranslation } from "react-i18next";

function na(count: number, naText: string): string {
  return count > 0 ? String(count) : naText;
}

export default function TrackersScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  const { t } = useTranslation();
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
          const naText = t("na");
          const lastAnnounce =
            tracker.lastAnnounceTime > 0
              ? new Date(tracker.lastAnnounceTime * 1_000).toLocaleString()
              : naText;
          const nextAnnounce =
            tracker.nextAnnounceTime > 0
              ? new Date(tracker.nextAnnounceTime * 1_000).toLocaleString()
              : naText;

          const lastScrape =
            tracker.lastScrapeTime > 0
              ? new Date(tracker.lastScrapeTime * 1_000).toLocaleString()
              : naText;
          const nextScrape =
            tracker.lastScrapeTime > 0
              ? new Date(tracker.nextScrapeTime * 1_000).toLocaleString()
              : naText;

          return (
            <View style={{ gap: 8 }}>
              <Text numberOfLines={1} style={styles.title}>
                {t("tier_label", { tier: tracker.tier + 1, host: url.host })}
              </Text>
              <View>
                <KeyValue
                  style={styles.kv}
                  field={t("last_announce")}
                  value={lastAnnounce}
                />
                <KeyValue
                  style={styles.kv}
                  field={t("result")}
                  value={
                    tracker.lastAnnounceSucceeded
                      ? t("peers_count", { value: tracker.lastAnnouncePeerCount > 0 ? tracker.lastAnnouncePeerCount : naText })
                      : tracker.lastAnnounceResult
                  }
                />
                <KeyValue
                  style={styles.kv}
                  field={t("next_announce")}
                  value={nextAnnounce}
                />
              </View>
              <View>
                <KeyValue
                  style={styles.kv}
                  field={t("last_scrape")}
                  value={lastScrape}
                />
                <KeyValue
                  style={styles.kv}
                  field={t("result")}
                  value={
                    tracker.lastScrapeSucceeded
                      ? t("success")
                      : tracker.lastScrapeResult
                  }
                />
                <KeyValue
                  style={styles.kv}
                  field={t("next_scrape")}
                  value={nextScrape}
                />
              </View>
              <View>
                <KeyValue
                  style={styles.kv}
                  field={t("seeders")}
                  value={na(tracker.seederCount, naText)}
                />
                <KeyValue
                  style={styles.kv}
                  field={t("leechers")}
                  value={na(tracker.leecherCount, naText)}
                />
                <KeyValue
                  style={styles.kv}
                  field={t("downloaded")}
                  value={na(tracker.downloadCount, naText)}
                />
              </View>
            </View>
          );
        }}
        keyExtractor={({ announce, scrape }) => announce + scrape}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>{t("no_trackers_found")}</Text>
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
