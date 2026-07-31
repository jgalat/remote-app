import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Pressable from "~/components/pressable";
import Text from "~/components/text";
import View from "~/components/view";
import { useTheme } from "~/hooks/use-theme-color";
import type { Server } from "~/store/settings";
import { displayServerAddress } from "~/utils/server-address";

export function torrentDestinationName(server: Server): string {
  if (server.name) return server.name;
  if (server.type === "qbittorrent") return "qBittorrent";
  if (server.type === "local") return "Local";
  return "Transmission";
}

export function torrentDestinationDescription(server: Server): string {
  if (server.type === "local") return "On this device · libtorrent4j";
  const type = server.type === "qbittorrent" ? "qBittorrent" : "Transmission";
  return `${type} · ${displayServerAddress(server.url)}`;
}

type TorrentDestinationProps = {
  server: Server;
  selectable: boolean;
  onPress: () => void;
};

export default React.memo(function TorrentDestination({
  server,
  selectable,
  onPress,
}: TorrentDestinationProps) {
  const { gray, lightGray, text, tint } = useTheme();
  const name = torrentDestinationName(server);
  const description = torrentDestinationDescription(server);

  return (
    <Pressable
      accessibilityRole={selectable ? "button" : undefined}
      accessibilityLabel={`${name}, ${description}${selectable ? ", change destination" : ""}`}
      disabled={!selectable}
      onPress={selectable ? onPress : undefined}
      style={[styles.container, { borderColor: lightGray }]}
    >
      <Feather
        name={server.type === "local" ? "hard-drive" : "server"}
        size={20}
        color={server.type === "local" ? tint : text}
      />
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text color={gray} style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      </View>
      {selectable ? (
        <Feather name="chevron-right" size={20} color={gray} />
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copy: {
    minWidth: 0,
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
  },
  description: {
    fontSize: 12,
  },
});
