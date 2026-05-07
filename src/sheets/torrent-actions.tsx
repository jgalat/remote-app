import * as React from "react";
import { Platform, Share, ToastAndroid } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { router } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTorrentActions, Torrent } from "~/hooks/torrent";
import { useTheme } from "~/hooks/use-theme-color";
import { useIsLocalServer } from "~/hooks/use-settings";
import { useExportToDownloads } from "@remote-app/pro";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import type { OptionProps } from "~/components/option";
import {
  MOVE_TORRENT_SHEET_ID,
  REMOVE_CONFIRM_SHEET_ID,
  RENAME_PATH_SHEET_ID,
  TORRENT_ACTIONS_SHEET_ID,
} from "./ids";

export type Payload = {
  torrents: Torrent[];
  info?: boolean;
};

function TorrentActionsSheet({
  payload: { torrents, info = false } = {
    torrents: [],
    info: false,
  },
  ...props
}: SheetProps<typeof TORRENT_ACTIONS_SHEET_ID>) {
  const { red } = useTheme();
  const { clear } = useTorrentSelection();
  const actions = useTorrentActions();
  const isLocal = useIsLocalServer();
  const exportToDownloads = useExportToDownloads();

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
    // Move is hidden on local servers — the engine writes to a fixed
    // app-scoped Downloads dir and there's no destination to choose.
    ...(isLocal
      ? []
      : [
          {
            label: "Move",
            left: "folder" as const,
            onPress: () => {
              const downloadDir =
                torrents.length === 1
                  ? torrents[0].downloadDir ?? undefined
                  : undefined;
              setTimeout(
                () =>
                  SheetManager.show(MOVE_TORRENT_SHEET_ID, {
                    payload: { ids, downloadDir },
                  }),
                100,
              );
            },
          },
        ]),
  ];

  // Export to Downloads is a local-only action: copies every file in the
  // torrent into the public MediaStore.Downloads collection, preserving
  // folder structure. Android 10+ only — pre-10 share is small and the
  // action would need WRITE_EXTERNAL_STORAGE which we no longer declare.
  // Gated on 100% complete: exporting a half-downloaded torrent would
  // surface a partial file in Downloads, which is misleading.
  if (
    isLocal &&
    Platform.OS === "android" &&
    typeof Platform.Version === "number" &&
    Platform.Version >= 29 &&
    torrents.length === 1 &&
    torrents[0].percentDone >= 1
  ) {
    const [{ id }] = torrents;
    options.push({
      label: "Export to Downloads",
      left: "download",
      onPress: () => exportToDownloads.mutate({ infoHash: String(id) }),
    });
  }

  if (torrents.length === 1) {
    const [{ id, name, magnetLink }] = torrents;
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
      // Rename is hidden for local servers — see file-actions.tsx for the
      // rationale (libtorrent4j 2.x rename quirks make it unreliable).
      ...(isLocal
        ? []
        : [
            {
              label: "Rename",
              left: "edit-2" as const,
              onPress: () => {
                setTimeout(
                  () =>
                    SheetManager.show(RENAME_PATH_SHEET_ID, {
                      payload: {
                        id,
                        path: name,
                        currentName: name,
                        kind: "torrent" as const,
                      },
                    }),
                  100,
                );
              },
            },
          ]),
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
        left: "trash-2",
        color: red,
        onPress: () => {
          setTimeout(
            () =>
              SheetManager.show(REMOVE_CONFIRM_SHEET_ID, {
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

TorrentActionsSheet.sheetId = TORRENT_ACTIONS_SHEET_ID;

export default TorrentActionsSheet;
