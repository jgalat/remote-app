import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { TorrentGetResponse } from "transmission-client";

import View from "./view";
import Text from "./text";
import { status } from "../utils/torrent";

export type TorrentItemProps = {
  torrent: TorrentGetResponse["torrents"][number];
};

export default function ({ torrent }: TorrentItemProps) {
  return (
    <View style={styles.container}>
      <Text>{torrent.name}</Text>
      <Text>{status(torrent.status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
