import * as React from "react";
import { Share } from "react-native";
import { useLinkTo } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Torrent } from "@remote-app/transmission-client";

import { ActionSheetContext } from "../contexts/action-sheet";
import { useTorrentActions } from "./use-transmission";
import { useTheme } from "./use-theme-color";
import useSettings from "./use-settings";
import type { Sort } from "../store/settings";

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
    (torrent: Torrent) => {
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

export function useSortBySheet() {
  const actionSheet = useActionSheet();
  const { settings, store } = useSettings();
  const { sort, direction } = settings;

  const update = React.useCallback(
    (s: Sort): (() => Promise<void>) => {
      return async () => {
        if (s === sort) {
          return await store({
            ...settings,
            direction: direction === "desc" ? "asc" : "desc",
          });
        }
        return await store({
          ...settings,
          direction: "desc",
          sort: s,
        });
      };
    },
    [sort, direction, settings]
  );

  const right = React.useCallback(
    (s: Sort): React.ComponentProps<typeof Feather>["name"] | undefined =>
      s !== sort
        ? undefined
        : direction === "asc"
        ? "chevron-down"
        : "chevron-up",
    [sort, direction]
  );

  return React.useCallback(() => {
    actionSheet.show({
      title: "Sort by",
      options: [
        {
          label: "Queue",
          left: "chevron-right",
          onPress: update("queue"),
          right: right("queue"),
        },
        {
          label: "Activity",
          left: "chevron-right",
          onPress: update("activity"),
          right: right("activity"),
        },
        {
          label: "Age",
          left: "chevron-right",
          onPress: update("age"),
          right: right("age"),
        },
        {
          label: "Name",
          left: "chevron-right",
          onPress: update("name"),
          right: right("name"),
        },
        {
          label: "Progress",
          left: "chevron-right",
          onPress: update("progress"),
          right: right("progress"),
        },
        {
          label: "Size",
          left: "chevron-right",
          onPress: update("size"),
          right: right("size"),
        },
        {
          label: "Status",
          left: "chevron-right",
          onPress: update("status"),
          right: right("status"),
        },
        {
          label: "Time Remaining",
          left: "chevron-right",
          onPress: update("time-remaining"),
          right: right("time-remaining"),
        },
        {
          label: "Ratio",
          left: "chevron-right",
          onPress: update("ratio"),
          right: right("ratio"),
        },
      ],
    });
  }, [actionSheet, update, right]);
}
