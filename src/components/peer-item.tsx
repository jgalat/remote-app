import * as React from "react";
import { Share, StyleSheet, ToastAndroid } from "react-native";
import { Feather } from "@expo/vector-icons";

import View from "./view";
import Text from "./text";
import ProgressBar from "./progress-bar";
import Pressable from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";
import { ExtTorrent } from "~/hooks/transmission";
import { formatSpeed } from "~/utils/formatters";

export type Props = {
  data: ExtTorrent["peers"][number];
};

export default React.memo(function PeerItem({ data }: Props) {
  const { tint, green, red, gray } = useTheme();

  const address = `${data.isUTP ? "utp" : "tcp"}://${data.address}:${
    data.port
  }`;

  const share = React.useCallback(async () => {
    try {
      await Share.share(
        {
          message: address,
        },
        { dialogTitle: `Share peer` }
      );
    } catch {
      ToastAndroid.show("Failed to share peer", ToastAndroid.SHORT);
    }
  }, [address]);

  return (
    <Pressable onLongPress={share}>
      <View style={styles.container}>
        <View style={styles.stats}>
          <Text numberOfLines={1} style={styles.name}>
            {address}
          </Text>
          <ProgressBar
            style={styles.progress}
            progress={data.progress * 100}
            color={tint}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
                <Feather name="monitor" color={gray} /> {data.clientName}
              </Text>
              <Text color={gray} style={styles.data}>
                {data.isEncrypted ? (
                  <>
                    <Feather name="lock" color={green} /> Encrypted
                  </>
                ) : (
                  <>
                    <Feather name="unlock" color={red} /> Unencrypted
                  </>
                )}
              </Text>
            </View>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
                <Feather name="arrow-down" color={gray} />{" "}
                {formatSpeed(data.rateToClient)}
              </Text>
              <Text color={gray} style={styles.data}>
                <Feather name="arrow-up" color={gray} />{" "}
                {formatSpeed(data.rateToPeer)}
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
