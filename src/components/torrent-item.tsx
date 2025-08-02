import * as React from "react";
import { StyleSheet } from "react-native";
import { Torrent, TorrentStatus } from "@remote-app/transmission-client";
import { Feather } from "@expo/vector-icons";

import View from "./view";
import Text from "./text";
import ProgressBar from "./progress-bar";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "../hooks/use-theme-color";
import {
  formatSize,
  formatSpeed,
  formatETA,
  formatStatus,
} from "../utils/formatters";

export type TorrentItemProps = {
  torrent: Torrent;
  left?: React.ReactNode;
} & PressableProps;

export default React.memo(function TorrentItem({
  torrent,
  left,
  ...props
}: TorrentItemProps) {
  const { text: color, green, yellow, red, gray } = useTheme();

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
    <Pressable {...props}>
      <View style={styles.container}>
        {left ? <View style={styles.left}>{left}</View> : null}
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
                <Feather name="arrow-down" color={gray} />{" "}
                {formatSpeed(torrent.rateDownload)}
              </Text>
              <Text color={gray} style={styles.data}>
                <Feather name="arrow-up" color={gray} />{" "}
                {formatSpeed(torrent.rateUpload)}
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
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 8,
  },
  stats: {
    flex: 1,
    flexShrink: 1,
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
