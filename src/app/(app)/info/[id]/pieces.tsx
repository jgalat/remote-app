import * as React from "react";
import { StyleSheet } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Screen from "~/components/screen";
import { useTorrent } from "~/hooks/transmission";
import {
  NetworkErrorScreen,
  LoadingScreen,
} from "~/components/utility-screens";
import PiecesCanvas from "~/components/pieces-canvas";
import { useTheme } from "~/hooks/use-theme-color";
import View from "~/components/view";
import Text from "~/components/text";
import { count } from "~/utils/pieces";
import { formatSize } from "~/utils/formatters";

export default function PiecesScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  const { green, lightestGray } = useTheme();

  const value = React.useMemo(() => {
    if (!torrents || torrents.length !== 1) return "";
    const torrent = torrents[0];
    return `${count(torrent.pieces)}/${torrent.pieceCount} (${formatSize(
      torrent.pieceSize
    )})`;
  }, [torrents]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrents || torrents.length !== 1) {
    return <LoadingScreen />;
  }

  const torrent = torrents[0];

  return (
    <Screen
      variant="scroll"
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{value}</Text>
      </View>
      <PiecesCanvas
        pieces={torrent.pieces}
        pieceCount={torrent.pieceCount}
        columns={24}
        gap={2}
        onColor={green}
        offColor={lightestGray}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    textAlign: "center",
  },
  container: {
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 24,
  },
});
