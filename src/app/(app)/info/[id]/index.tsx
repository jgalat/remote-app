import * as React from "react";
import { SectionList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import { useTranslation } from "react-i18next";

import Text from "~/components/text";
import Screen from "~/components/screen";
import TorrentItem from "~/components/torrent-item";
import { useTorrent } from "~/hooks/transmission";
import KeyValue, { KeyValueProps } from "~/components/key-value";
import { formatSize, formatStatus } from "~/utils/formatters";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import { count } from "~/utils/pieces";

export default function TorrentDetailsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  const { t } = useTranslation();

  const data = React.useMemo<
    {
      section: string;
      data: KeyValueProps[];
    }[]
  >(() => {
    if (!torrents || torrents.length !== 1) {
      return [];
    }

    const torrent = torrents[0];

    return [
      {
        section: t("info"),
        data: [
          {
            field: t("field_name"),
            value: torrent.name,
          },
          {
            field: t("field_status"),
            value: t(formatStatus(torrent.status)),
          },
          {
            field: t("field_magnet_link"),
            value: torrent.magnetLink,
            copy: true,
          },
        ],
      },
      {
        section: t("section_data"),
        data: [
          {
            field: t("field_progress"),
            value: `${(torrent.percentDone * 100).toFixed(1)}%`,
          },
          {
            field: t("field_downloaded"),
            value: formatSize(torrent.downloadedEver),
          },
          {
            field: t("field_uploaded"),
            value: `${formatSize(
              torrent.uploadedEver
            )} (${torrent.uploadRatio.toFixed(2)})`,
          },
          {
            field: t("field_pieces"),
            value: `${count(torrent.pieces)}/${
              torrent.pieceCount
            } (${formatSize(torrent.pieceSize)})`,
          },
          {
            field: t("field_peers"),
            value: `${torrent.peersSendingToUs} - ${torrent.peersGettingFromUs}`,
          },
        ],
      },
      {
        section: t("section_files"),
        data: [
          {
            field: t("field_location"),
            value: torrent.downloadDir,
          },
          {
            field: t("field_total_size"),
            value: formatSize(torrent.totalSize),
          },
          {
            field: t("field_files"),
            value: torrent.files.length,
          },
        ],
      },
      {
        section: t("section_dates"),
        data: [
          {
            field: t("field_added"),
            value: new Date(torrent.addedDate * 1000).toLocaleString(),
          },
          {
            field: t("field_last_activity"),
            value: new Date(torrent.activityDate * 1000).toLocaleString(),
          },
          ...(torrent.doneDate !== 0
            ? [
                {
                  field: t("field_completed"),
                  value: new Date(torrent.doneDate * 1000).toLocaleString(),
                },
              ]
            : []),
        ],
      },
    ];
  }, [torrents, t]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={{ paddingTop: 16 }}>
      <TorrentItem disabled torrent={torrents[0]} />
      <SectionList
        // fadingEdgeLength={64}
        sections={data}
        renderSectionHeader={({ section }) => (
          <Text style={styles.title}>{section.section}</Text>
        )}
        renderItem={({ item }) => <KeyValue {...item} />}
        keyExtractor={({ field }) => field}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 24,
    marginBottom: 8,
    marginTop: 24,
  },
});
