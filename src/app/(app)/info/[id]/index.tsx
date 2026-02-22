import * as React from "react";
import { SectionList, StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import Screen from "~/components/screen";
import TorrentItem from "~/components/torrent-item";
import { useTorrent } from "~/hooks/torrent";
import KeyValue, { KeyValueProps } from "~/components/key-value";
import { formatSize, formatStatus } from "~/utils/formatters";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import { count } from "~/utils/pieces";

export default function TorrentDetailsScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrent, error, isLoading, refetch } = useTorrent(id);

  const data = React.useMemo<
    {
      section: string;
      data: KeyValueProps[];
    }[]
  >(() => {
    if (!torrent) {
      return [];
    }

    return [
      {
        section: "Info",
        data: [
          {
            field: "Name",
            value: torrent.name,
          },
          {
            field: "Status",
            value: formatStatus(torrent.status),
          },
          {
            field: "Magnet Link",
            value: torrent.magnetLink,
            copy: true,
          },
        ],
      },
      {
        section: "Data",
        data: [
          {
            field: "Progress",
            value: `${(torrent.percentDone * 100).toFixed(1)}%`,
          },
          {
            field: "Downloaded",
            value: formatSize(torrent.downloadedEver),
          },
          {
            field: "Uploaded",
            value: `${formatSize(
              torrent.uploadedEver
            )} (${torrent.uploadRatio.toFixed(2)})`,
          },
          {
            field: "Pieces",
            value: `${count(torrent.pieces)}/${
              torrent.pieceCount
            } (${formatSize(torrent.pieceSize)})`,
          },
          {
            field: "Peers",
            value: `${torrent.peersSendingToUs} - ${torrent.peersGettingFromUs}`,
          },
        ],
      },
      {
        section: "Files",
        data: [
          {
            field: "Location",
            value: torrent.downloadDir,
          },
          {
            field: "Total Size",
            value: formatSize(torrent.totalSize),
          },
          {
            field: "Files",
            value: torrent.files.length,
          },
        ],
      },
      {
        section: "Dates",
        data: [
          {
            field: "Added",
            value: new Date(torrent.addedDate * 1000).toLocaleString(),
          },
          {
            field: "Last activity",
            value: new Date(torrent.activityDate * 1000).toLocaleString(),
          },
          ...(torrent.doneDate !== 0
            ? [
                {
                  field: "Completed",
                  value: new Date(torrent.doneDate * 1000).toLocaleString(),
                },
              ]
            : []),
        ],
      },
    ];
  }, [torrent]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrent) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={{ paddingTop: 16 }}>
      <TorrentItem disabled torrent={torrent} />
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
