import * as React from "react";
import { Share, ToastAndroid } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { SheetManager } from "react-native-actions-sheet";
import type { Torrent } from "@remote-app/transmission-client";

import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTorrentActions } from "../hooks/use-transmission";
import { useTheme } from "../hooks/use-theme-color";
import useTorrentSelection from "../hooks/use-torrent-selection";
import RemoveConfirmSheet from "./remove-confirm";

import type { OptionProps } from "../components/option";

export type Payload = {
  torrents: Torrent[];
  details?: boolean;
};

function TorrentActionsSheet({
  payload: { torrents, details = true },
  ...props
}: SheetProps<Payload>) {
  const { red } = useTheme();
  const torrentActions = useTorrentActions();
  const linkTo = useLinkTo();
  const { clear } = useTorrentSelection();

  const wrap = React.useCallback(
    (action: (ids: Torrent["id"][]) => Promise<void>, ids: Torrent["id"][]) =>
      async () => {
        await action(ids);
        clear();
      },
    [clear]
  );

  const ids: Torrent["id"][] = torrents.map((t) => t.id);

  let options: OptionProps[] = [
    {
      label: "Start",
      left: "play",
      onPress: wrap(torrentActions.start, ids),
    },
    {
      label: "Start now",
      left: "play",
      onPress: wrap(torrentActions.startNow, ids),
    },
    {
      label: "Stop",
      left: "pause",
      onPress: wrap(torrentActions.stop, ids),
    },
    {
      label: "Verify",
      left: "check-circle",
      onPress: wrap(torrentActions.verify, ids),
    },
    {
      label: "Reannounce",
      left: "radio",
      onPress: wrap(torrentActions.reannounce, ids),
    },
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

  if (torrents.length === 1 && details) {
    const [{ id }] = torrents;
    options = [
      {
        label: "Details",
        left: "info",
        onPress: () => linkTo(`/torrents/${id}`),
      },
      ...options,
    ];
  }

  return <ActionSheet title="Action" options={options} {...props} />;
}

TorrentActionsSheet.sheetId = "torrent-actions";

export default TorrentActionsSheet;
