import * as React from "react";
import { Share } from "react-native";
import { useLinkTo } from "@react-navigation/native";

import { ActionSheetContext } from "../contexts/action-sheet";
import { useTorrentActions } from "./use-transmission";
import { useTheme } from "./use-theme-color";
import { TorrentGetResponse } from "../../transmission-client/dist";

export default function useActionSheet() {
  return React.useContext(ActionSheetContext);
}

export function useAddTorrentSheet() {
  const actionSheet = useActionSheet();
  const linkTo = useLinkTo();
  return React.useCallback(() => {
    actionSheet.show({
      title: "Add a Torrent",
      options: [
        {
          label: "File",
          left: "file",
          onPress: () => linkTo("/add-file"),
        },
        {
          label: "Magnet URL",
          left: "link",
          onPress: () => linkTo("/add-magnet"),
        },
      ],
    });
  }, [actionSheet, linkTo]);
}

export function useTorrentActionsSheet() {
  const { red } = useTheme();
  const actionSheet = useActionSheet();
  const torrentActions = useTorrentActions();
  const linkTo = useLinkTo();

  const confirmRemoveSheet = React.useCallback(
    (id: number) => {
      actionSheet.show({
        title: "Are you sure?",
        options: [
          {
            label: "Remove",
            left: "trash",
            color: red,
            onPress: () => torrentActions.remove(id),
          },
          {
            label: "Remove & Trash data",
            left: "trash-2",
            color: red,
            onPress: () =>
              torrentActions.remove(id, { "delete-local-data": true }),
          },
        ],
      });
    },
    [actionSheet, torrentActions]
  );

  return React.useCallback(
    (torrent: TorrentGetResponse["torrents"][number]) => {
      let requiresConfirmation = false;
      actionSheet.show({
        title: "Action",
        options: [
          {
            label: "Details",
            left: "info",
            onPress: () => linkTo(`/torrents/${torrent.id}`),
          },
          {
            label: "Share",
            left: "share",
            onPress: async () => {
              try {
                await Share.share(
                  {
                    message: torrent.magnetLink,
                  },
                  { dialogTitle: `Share ${torrent.name}` }
                );
              } catch (e) {
                console.warn(e);
              }
            },
          },
          {
            label: "Start",
            left: "play",
            onPress: () => torrentActions.start(torrent.id),
          },
          {
            label: "Start now",
            left: "play",
            onPress: () => torrentActions.startNow(torrent.id),
          },
          {
            label: "Stop",
            left: "pause",
            onPress: () => torrentActions.stop(torrent.id),
          },
          {
            label: "Verify",
            left: "check-circle",
            onPress: () => torrentActions.verify(torrent.id),
          },
          {
            label: "Reannounce",
            left: "radio",
            onPress: () => torrentActions.reannounce(torrent.id),
          },
          {
            label: "Remove",
            left: "trash",
            color: red,
            onPress: () => (requiresConfirmation = true),
          },
        ],
        onClose: () => {
          if (requiresConfirmation) {
            confirmRemoveSheet(torrent.id);
          }
        },
      });
    },
    [actionSheet, confirmRemoveSheet, torrentActions, red]
  );
}
