import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { TorrentGetResponse } from "transmission-client";

import View from "./view";
import Text from "./text";
import ActionIcon from "./action-icon";
import { useTheme } from "../hooks/use-theme-color";
import useFormatter from "../hooks/use-formatter";
import { useTorrentAction } from "../hooks/use-transmission";

export type TorrentItemProps = {
  torrent: TorrentGetResponse["torrents"][number];
};

export default function ({ torrent }: TorrentItemProps) {
  const { text: color, gray } = useTheme();
  const { formatSize, formatSpeed, formatETA, formatStatus } = useFormatter();
  const { start, stop } = useTorrentAction(torrent.id);

  let status = formatStatus(torrent.status);
  switch (status) {
    case "downloading":
      status = `${status} - ${torrent.peersSendingToUs} / ${torrent.peersConnected} peers`;
      break;
    case "seeding":
      status = `${status} - ${torrent.peersGettingFromUs} / ${torrent.peersConnected} peers`;
      break;
  }

  let size = `${formatSize(
    torrent.percentDone * torrent.totalSize
  )} / ${formatSize(torrent.totalSize)} (${torrent.uploadRatio.toFixed(2)})`;
  if (torrent.percentDone == 1) {
    size = `${formatSize(torrent.totalSize)} - ${formatSize(
      torrent.uploadedEver
    )} (${torrent.uploadRatio.toFixed(2)})`;
  }

  return (
    <TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.icon}>
          <ActionIcon
            name={status === "stopped" ? "play" : "pause"}
            color={color}
            size={24}
            onPress={status === "stopped" ? start : stop}
          />
        </View>
        <View style={styles.stats}>
          <Text numberOfLines={1} style={styles.name}>
            {torrent.name}
          </Text>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={[styles.data, { color: gray }]}>{status}</Text>
              <Text style={[styles.data, { color: gray }]}>{size}</Text>
            </View>
            <View style={styles.column}>
              <Text style={[styles.data, { color: gray }]}>
                {formatSpeed(torrent.rateDownload)}
              </Text>
              <Text style={[styles.data, { color: gray }]}>
                {formatSpeed(torrent.rateUpload)}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.progress,
              {
                width: `${torrent.percentDone * 100}%`,
                backgroundColor: color,
              },
            ]}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={[styles.data, { color: gray }]}>
                {(torrent.percentDone * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.column}>
              <Text style={[styles.data, { color: gray }]}>
                {formatETA(torrent.eta)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    flexDirection: "column",
    justifyContent: "center",
  },
  stats: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  name: {
    fontWeight: "500",
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    marginBottom: 2,
  },
  progress: {
    marginTop: 4,
    marginBottom: 4,
    height: 8,
  },
});
