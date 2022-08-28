import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Torrent, TorrentStatus } from "@remote-app/transmission-client";

import View from "./view";
import Text from "./text";
import ActionIcon from "./action-icon";
import ProgressBar from "./progress-bar";
import { useTheme } from "../hooks/use-theme-color";
import { useTorrentActions } from "../hooks/use-transmission";
import {
  formatSize,
  formatSpeed,
  formatETA,
  formatStatus,
} from "../utils/formatters";

export type TorrentItemProps = {
  torrent: Torrent;
} & React.ComponentProps<typeof TouchableOpacity>;

export default function ({ torrent, ...props }: TorrentItemProps) {
  const { text: color, green, yellow, red, gray } = useTheme();
  const { start, stop } = useTorrentActions();

  let status = formatStatus(torrent.status);
  let progress = torrent.percentDone * 100;
  let progressColor = color;
  switch (torrent.status) {
    case TorrentStatus.DOWNLOADING:
      status = `${status} - ${torrent.peersSendingToUs} / ${torrent.peersConnected} peers`;
      break;
    case TorrentStatus.SEEDING:
      status = `${status} - ${torrent.peersGettingFromUs} / ${torrent.peersConnected} peers`;
      progressColor = green;
      break;
    case TorrentStatus.VERIFYING_LOCAL_DATA:
      progress = torrent.recheckProgress * 100;
      progressColor = yellow;
      break;
    default:
      progressColor = gray;
      break;
  }

  let size = `${formatSize(
    torrent.percentDone * torrent.totalSize
  )} / ${formatSize(torrent.totalSize)} (${
    torrent.uploadRatio < 0 ? "0.00" : torrent.uploadRatio.toFixed(2)
  })`;
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
            name={torrent.status === TorrentStatus.STOPPED ? "play" : "pause"}
            color={color}
            size={24}
            onPress={() =>
              torrent.status === TorrentStatus.STOPPED
                ? start(torrent.id)
                : stop(torrent.id)
            }
          />
        </View>
        <View style={styles.stats}>
          <Text numberOfLines={1} style={styles.name}>
            {torrent.name}
          </Text>
          <View style={styles.row}>
            <View style={[styles.column, { flex: 1 }]}>
              <Text
                numberOfLines={1}
                color={torrent.error ? red : gray}
                style={styles.data}
              >
                {torrent.error ? torrent.errorString : status}
              </Text>
              <Text color={gray} style={styles.data}>
                {size}
              </Text>
            </View>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
                ↓ {formatSpeed(torrent.rateDownload)}
              </Text>
              <Text color={gray} style={styles.data}>
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
              <Text color={gray} style={styles.data}>
                {progress.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
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
    fontFamily: "RobotoMono-Medium",
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
