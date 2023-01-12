import * as React from "react";
import { Share, ToastAndroid } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { SheetManager } from "react-native-actions-sheet";
import type { Torrent } from "@remote-app/transmission-client";

import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTorrentActions } from "../hooks/use-transmission";
import { useTheme } from "../hooks/use-theme-color";
import { REMOVE_CONFIRM_SHEET_NAME } from "./remove-confirm";

import type { OptionProps } from "../components/option";

export type Payload = {
  torrent: Torrent;
  showDetails?: boolean;
};

export const TORRENT_ACTIONS_SHEET_NAME = "torrent-actions";

export default function TorrentActionsSheet({
  payload: {
    torrent: { id, name, magnetLink },
    showDetails = true,
  },
  ...props
}: SheetProps<Payload>) {
  const { red } = useTheme();
  const torrentActions = useTorrentActions();
  const linkTo = useLinkTo();

  let options: OptionProps[] = [
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
          ToastAndroid.show("Failed to share magnet link", ToastAndroid.SHORT);
        }
      },
    },
    {
      label: "Start",
      left: "play",
      onPress: () => torrentActions.start(id),
    },
    {
      label: "Start now",
      left: "play",
      onPress: () => torrentActions.startNow(id),
    },
    {
      label: "Stop",
      left: "pause",
      onPress: () => torrentActions.stop(id),
    },
    {
      label: "Verify",
      left: "check-circle",
      onPress: () => torrentActions.verify(id),
    },
    {
      label: "Reannounce",
      left: "radio",
      onPress: () => torrentActions.reannounce(id),
    },
    {
      label: "Remove",
      left: "trash",
      color: red,
      onPress: () =>
        SheetManager.show(REMOVE_CONFIRM_SHEET_NAME, { payload: id }),
    },
  ];

  if (showDetails) {
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
