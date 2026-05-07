import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useTorrentActions, Torrent } from "~/hooks/torrent";
import { useIsLocalServer } from "~/hooks/use-settings";
import { REMOVE_CONFIRM_SHEET_ID } from "./ids";

export type Payload = Torrent["id"][];

function RemoveConfirmSheet({
  payload: ids,
  ...props
}: SheetProps<typeof REMOVE_CONFIRM_SHEET_ID>) {
  const { red } = useTheme();
  const { remove } = useTorrentActions();
  const isLocal = useIsLocalServer();

  // Local engine writes to app-scoped storage that isn't visible to the user
  // through Files by Google or any third-party file manager. "Remove" without
  // data would leave files orphaned in a hidden directory the user can't
  // reclaim short of uninstalling the app. Always delete data for local.
  const options = isLocal
    ? [
        {
          label: "Remove & Trash data",
          left: "trash-2" as const,
          color: red,
          onPress: () =>
            ids ? remove.mutate({ ids, deleteData: true }) : undefined,
        },
      ]
    : [
        {
          label: "Remove",
          left: "trash" as const,
          color: red,
          onPress: () => (ids ? remove.mutate({ ids }) : undefined),
        },
        {
          label: "Remove & Trash data",
          left: "trash-2" as const,
          color: red,
          onPress: () =>
            ids ? remove.mutate({ ids, deleteData: true }) : undefined,
        },
      ];

  return (
    <ActionSheet title="Are you sure?" options={options} {...props} />
  );
}

RemoveConfirmSheet.sheetId = REMOVE_CONFIRM_SHEET_ID;

export default RemoveConfirmSheet;
