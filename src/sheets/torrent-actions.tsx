import * as React from "react";
import { Share, ToastAndroid } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { router } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTorrentActions, Torrent } from "~/hooks/use-transmission";
import { useTheme } from "~/hooks/use-theme-color";
import RemoveConfirmSheet from "./remove-confirm";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import type { OptionProps } from "~/components/option";

export type Payload = {
  torrents: Torrent[];
  info?: boolean;
};

const sheetId = "torrent-actions" as const;

function TorrentActionsSheet({
  payload: { torrents, info = false } = {
    torrents: [],
    info: false,
  },
  ...props
}: SheetProps<typeof sheetId>) {
  const { red } = useTheme();
  const { clear } = useTorrentSelection();
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

  if (torrents.length === 1 && !info) {
    const [{ id }] = torrents;
    options = [
      {
        label: "Details",
        left: "info",
        onPress: () => {
          router.push(`/info/${id}`);
          clear();
        },
      },
      {
        label: "Settings",
        left: "settings",
        onPress: () => {
          router.push(`/info/${id}/settings`);
          clear();
        },
      },
      ...options,
    ];
  }

  if (!info) {
    options = [
      ...options,
      {
        label: "Remove",
        left: "trash",
        color: red,
        onPress: () => {
          setTimeout(
            () =>
              SheetManager.show(RemoveConfirmSheet.sheetId, {
                payload: ids,
              }),
            100
          );
        },
      },
    ];
  }

  return <ActionSheet title="Action" options={options} {...props} />;
}

TorrentActionsSheet.sheetId = sheetId;

export default TorrentActionsSheet;
