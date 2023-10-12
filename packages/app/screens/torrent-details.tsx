import * as React from "react";
import { SectionList, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import Text from "../components/text";
import Screen from "../components/screen";
import TorrentItem from "../components/torrent-item";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import { useTorrent } from "../hooks/use-transmission";
import { useTheme } from "../hooks/use-theme-color";
import { RootStackParamList } from "../types";
import { useTorrentActionsSheet } from "../hooks/use-action-sheet";
import KeyValue, { KeyValueProps } from "../components/key-value";
import { formatSize, formatStatus } from "../utils/formatters";
import { NetworkErrorScreen, LoadingScreen } from "./utils";

export default function TorrentDetailsScreen() {
  const {
    params: { id },
  } =
    useRoute<
      NativeStackScreenProps<RootStackParamList, "TorrentDetails">["route"]
    >();
  const navigation = useNavigation();

  const { data: torrents, error, isLoading, refetch } = useTorrent(id);
  const { text } = useTheme();
  const torrentActionsSheet = useTorrentActionsSheet();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        error || !torrents ? null : (
          <ActionList>
            <ActionIcon
              onPress={() =>
                torrentActionsSheet({ torrents, individual: true })
              }
              name="more-vertical"
            />
          </ActionList>
        ),
    });
  }, [id, text, torrents, error, torrentActionsSheet, navigation]);

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
            value: `${torrent.pieceCount} * ${formatSize(torrent.pieceSize)}`,
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
            field: "Completed",
            value:
              torrent.doneDate === -1
                ? ""
                : new Date(torrent.doneDate * 1000).toLocaleString(),
          },
          {
            field: "Last activity",
            value: new Date(torrent.activityDate * 1000).toLocaleString(),
          },
        ],
      },
    ];
  }, [torrents]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      <TorrentItem disabled torrent={torrents[0]} />
      <SectionList
        fadingEdgeLength={64}
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
