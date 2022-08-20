import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import {
  TorrentGetResponse,
  TorrentStatus,
} from "@remote-app/transmission-client";

import View from "./view";
import Text from "./text";
import ActionIcon from "./action-icon";
import ProgressBar from "./progress-bar";
import { useTheme } from "../hooks/use-theme-color";
import useFormatter from "../hooks/use-formatter";
import { useTorrentAction } from "../hooks/use-transmission";

export type TorrentItemProps = {
  torrent: TorrentGetResponse["torrents"][number];
} & React.ComponentProps<typeof TouchableOpacity>;

export default function ({ torrent, ...props }: TorrentItemProps) {
  const { text: color, green, yellow, gray } = useTheme();
  const { formatSize, formatSpeed, formatETA, formatStatus } = useFormatter();
  const { start, stop } = useTorrentAction(torrent.id);

  let status = formatStatus(torrent.status);
  let progress = torrent.percentDone * 100;
  let progressColor = color;
  switch (torrent.status) {
    case TorrentStatus.DOWNLOADING:
      status = `${status} - ${torrent.peersSendingToUs} / ${torrent.peersConnected} peers`;
      break;
    case TorrentStatus.SEEDING:
      status = `${status} - ${torrent.peersGettingFromUs} / ${torrent.peersConnected} peers`;
      progressColor =  green;
      break;
    case TorrentStatus.VERIFYING_LOCAL_DATA:
      progress = torrent.recheckProgress * 100;
      progressColor = yellow;
      status = `${status} - ${torrent.peersGettingFromUs} / ${torrent.peersConnected} peers`;
      break;
    default:
      progressColor = gray;
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
    <TouchableOpacity {...props}>
      <View style={styles.container}>
        <View style={styles.icon}>
          <ActionIcon
            name={status === "stopped" ? "play" : "pause"}
            color={color}
            size={24}
            onPress={() => (status === "stopped" ? start() : stop())}
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
                ↓ {formatSpeed(torrent.rateDownload)}
              </Text>
              <Text style={[styles.data, { color: gray }]}>
                ↑ {formatSpeed(torrent.rateUpload)}
              </Text>
            </View>
          </View>
          <ProgressBar
            style={styles.progress}
            progress={progress}
            color={progressColor}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={[styles.data, { color: gray }]}>
                {progress.toFixed(1)}%
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
  },
});
