import * as React from "react";
import { Share, ToastAndroid } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import type { Torrent } from "@remote-app/transmission-client";
import { router } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTorrentActions } from "~/hooks/use-transmission";
import { useTheme } from "~/hooks/use-theme-color";
import RemoveConfirmSheet from "./remove-confirm";

import type { OptionProps } from "~/components/option";

export type Payload = {
  torrents: Torrent[];
  individual?: boolean;
};

function TorrentActionsSheet({
  payload: { torrents, individual = false },
  ...props
}: SheetProps<Payload>) {
  const { red } = useTheme();
  const actions = useTorrentActions();

  const ids: Torrent["id"][] = torrents.map((t) => t.id);

  let options: OptionProps[] = [
    {
      label: "Start",
      left: "play",
      onPress: () => actions.start.mutate({ ids }),
    },
    {
      label: "Start now",
      left: "play",
      onPress: () => actions.startNow.mutate({ ids }),
    },
    {
      label: "Stop",
      left: "pause",
      onPress: () => actions.stop.mutate({ ids }),
    },
    {
      label: "Verify",
      left: "check-circle",
      onPress: () => actions.verify.mutate({ ids }),
    },
    {
      label: "Reannounce",
      left: "radio",
      onPress: () => actions.reannounce.mutate({ ids }),
    },
  ];

  if (torrents.length === 1) {
    const [{ name, magnetLink }] = torrents;
    options = [
      {
        label: "Share",
        left: "share",
        onPress: async () => {
          try {
            await Share.share(
              {
                message: magnetLink,
              },
              { dialogTitle: `Share ${name}` }
            );
          } catch {
            ToastAndroid.show(
              "Failed to share magnet link",
              ToastAndroid.SHORT
            );
          }
        },
      },
      ...options,
    ];
  }

  if (torrents.length === 1 && !individual) {
    const [{ id }] = torrents;
    options = [
      {
        label: "Details",
        left: "info",
        onPress: () => router.push(`/info/${id}`),
      },
      ...options,
    ];
  }

  if (!individual) {
    options = [
      ...options,
      {
        label: "Remove",
        left: "trash",
        color: red,
        onPress: () =>
          SheetManager.show(RemoveConfirmSheet.sheetId, {
            payload: ids,
          }),
      },
    ];
  }

  return <ActionSheet title="Action" options={options} {...props} />;
}

TorrentActionsSheet.sheetId = "torrent-actions";

export default TorrentActionsSheet;
