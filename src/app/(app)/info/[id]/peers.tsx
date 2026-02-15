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
import PeerItem from "~/components/peer-item";
import Separator from "~/components/separator";
import { useTranslation } from "react-i18next";

export default function PeersScreen() {
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
        data={torrents[0].peers}
        renderItem={({ item: peer }) => <PeerItem data={peer} />}
        keyExtractor={({ isUTP, address, port }) =>
          `${isUTP ? "utp" : "tcp"}://${address}:${port}`
        }
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>{t("no_peers_found")}</Text>
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
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
