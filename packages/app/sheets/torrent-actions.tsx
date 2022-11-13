import * as React from "react";
import { Share } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { SheetManager } from "react-native-actions-sheet";
import type { Torrent } from "@remote-app/transmission-client";

import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTorrentActions } from "../hooks/use-transmission";
import { useTheme } from "../hooks/use-theme-color";

import type { OptionProps } from "../components/option";

export type Payload = {
  torrent: Torrent;
  showDetails?: boolean;
};

export default function ({ payload, ...props }: SheetProps<Payload>) {
  const { red } = useTheme();
  const torrentActions = useTorrentActions();
  const linkTo = useLinkTo();

  const {
    torrent: { id, name, magnetLink },
    showDetails = true,
  } = payload!;

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
        } catch (e) {
          console.warn(e);
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
      onPress: () => SheetManager.show("remove-confirm", { payload: id }),
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
