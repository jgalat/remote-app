import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { SheetManager } from "react-native-actions-sheet";

import { createClient, TorrentStatus, type Session, type TorrentListItem } from "~/client";
import type { Server } from "~/store/settings";
import { formatSpeed } from "~/utils/formatters";
import { useTheme } from "~/hooks/use-theme-color";
import { queryKeys } from "~/hooks/torrent/query-keys";
import { SELECT_SHEET_ID } from "~/sheets/ids";
import type { SelectOption } from "~/sheets/select";
import Text from "./text";
import View from "./view";
import Pressable from "./pressable";

type Props = {
  torrents: TorrentListItem[];
  servers: Server[];
  connectedServers: number;
  totalServers: number;
};

export default React.memo(function CombinedStats({
  torrents,
  servers,
  connectedServers,
  totalServers,
}: Props) {
  const { text, gray } = useTheme();
  const queryClient = useQueryClient();
  const remoteServers = React.useMemo(
    () => servers.filter((server) => server.type !== "local"),
    [servers],
  );
  const sessions = useQueries({
    queries: remoteServers.map((server) => ({
      queryKey: queryKeys.sessionGet(server),
      queryFn: () => createClient(server).getSession(),
      staleTime: 5_000,
      retry: false,
    })),
  });
  const stats = React.useMemo(
    () => ({
      downloadSpeed: torrents.reduce(
        (total, torrent) => total + torrent.rateDownload,
        0,
      ),
      uploadSpeed: torrents.reduce(
        (total, torrent) => total + torrent.rateUpload,
        0,
      ),
      active: torrents.filter(
        (torrent) => torrent.status !== TorrentStatus.STOPPED,
      ).length,
    }),
    [torrents],
  );
  const alternativeSpeedEnabled = sessions.some(
    ({ data }) => data?.["alt-speed-enabled"],
  );

  const openSpeedModes = React.useCallback(() => {
    if (remoteServers.length === 0) return;

    const options: SelectOption[] = remoteServers.map((server, index) => {
      const session = sessions[index].data;
      const state = !session
        ? "unavailable"
        : session["alt-speed-enabled"]
          ? "alternative"
          : "standard";

      return {
        id: server.id,
        label: `${server.name} — ${state}`,
        left: !session
          ? "alert-triangle"
          : session["alt-speed-enabled"]
            ? "zap-off"
            : "zap",
        value: server.id,
        disabled: !session,
      };
    });

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        title: "Speed mode",
        options,
        onSelect: async (value) => {
          const index = remoteServers.findIndex((server) => server.id === value);
          const server = remoteServers[index];
          const session = sessions[index]?.data;
          if (!server || !session) return;

          const key = queryKeys.sessionGet(server);
          const enabled = !session["alt-speed-enabled"];
          queryClient.setQueryData<Session>(key, {
            ...session,
            "alt-speed-enabled": enabled,
          });

          try {
            await createClient(server).setSession({
              "alt-speed-enabled": enabled,
            });
          } catch {
            queryClient.setQueryData(key, session);
            ToastAndroid.show(
              `Failed to change speed mode on ${server.name}`,
              ToastAndroid.SHORT,
            );
          } finally {
            queryClient.invalidateQueries({ queryKey: queryKeys.session(server) });
          }
        },
      },
    });
  }, [queryClient, remoteServers, sessions]);

  return (
    <View style={styles.container}>
      <Text>
        <Feather name="arrow-down" color={text} />{" "}
        {formatSpeed(stats.downloadSpeed)}
      </Text>
      <Pressable
        style={styles.speedMode}
        onPress={openSpeedModes}
        disabled={remoteServers.length === 0}
        accessibilityRole="button"
        accessibilityLabel={`Speed modes, ${stats.active} active, ${connectedServers} of ${totalServers} servers online`}
      >
        <Feather
          name={alternativeSpeedEnabled ? "zap-off" : "zap"}
          color={text}
          size={20}
        />
        <Text color={gray} style={styles.summary}>
          {stats.active} active · {connectedServers}/{totalServers} online
        </Text>
      </Pressable>
      <Text>
        {formatSpeed(stats.uploadSpeed)}{" "}
        <Feather name="arrow-up" color={text} />
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summary: {
    fontSize: 9,
  },
  speedMode: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
});
