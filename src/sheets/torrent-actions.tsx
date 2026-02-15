import * as React from "react";
import { Share, ToastAndroid } from "react-native";
import { SheetManager } from "react-native-actions-sheet";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTorrentActions, Torrent } from "~/hooks/transmission";
import { useTheme } from "~/hooks/use-theme-color";
import RemoveConfirmSheet from "./remove-confirm";
import MoveTorrentSheet from "./move-torrent";
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
  const { t } = useTranslation();

  const ids: Torrent["id"][] = torrents.map((t) => t.id);

  let options: OptionProps[] = [
    {
      label: t("start"),
      left: "play",
      onPress: () => actions.start.mutate({ ids }),
    },
    {
      label: t("start_now"),
      left: "play",
      onPress: () => actions.startNow.mutate({ ids }),
    },
    {
      label: t("stop"),
      left: "pause",
      onPress: () => actions.stop.mutate({ ids }),
    },
    {
      label: t("verify"),
      left: "check-circle",
      onPress: () => actions.verify.mutate({ ids }),
    },
    {
      label: t("reannounce"),
      left: "radio",
      onPress: () => actions.reannounce.mutate({ ids }),
    },
    {
      label: t("move"),
      left: "folder",
      onPress: () => {
        const downloadDir =
          torrents.length === 1 ? torrents[0].downloadDir ?? undefined : undefined;
        setTimeout(
          () =>
            SheetManager.show(MoveTorrentSheet.sheetId, {
              payload: { ids, downloadDir },
            }),
          100
        );
      },
    },
  ];

  if (torrents.length === 1) {
    const [{ name, magnetLink }] = torrents;
    options = [
      {
        label: t("share"),
        left: "share",
        onPress: async () => {
          try {
            await Share.share(
              {
                message: magnetLink,
              },
              { dialogTitle: t("share_name", { name }) }
            );
          } catch {
            ToastAndroid.show(
              t("failed_to_share"),
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
        label: t("details"),
        left: "info",
        onPress: () => {
          router.push(`/info/${id}`);
          clear();
        },
      },
      {
        label: t("settings"),
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
        label: t("remove"),
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

  return <ActionSheet title={t("action")} options={options} {...props} />;
}

TorrentActionsSheet.sheetId = sheetId;

export default TorrentActionsSheet;
