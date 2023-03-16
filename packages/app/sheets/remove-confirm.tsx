import * as React from "react";
import { Torrent } from "@remote-app/transmission-client";

import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTheme } from "../hooks/use-theme-color";
import useTorrentSelection from "../hooks/use-torrent-selection";
import { useTorrentActions } from "../hooks/use-transmission";

function RemoveConfirmSheet({
  payload: ids,
  ...props
}: SheetProps<Torrent["id"][]>) {
  const { red } = useTheme();
  const { remove } = useTorrentActions();
  const { clear } = useTorrentSelection();

  return (
    <ActionSheet
      title="Are you sure?"
      options={[
        {
          label: "Remove",
          left: "trash",
          color: red,
          onPress: async () => {
            await remove(ids);
            clear();
          },
        },
        {
          label: "Remove & Trash data",
          left: "trash-2",
          color: red,
          onPress: async () => {
            await remove(ids, { "delete-local-data": true });
            clear();
          },
        },
      ]}
      {...props}
    />
  );
}

RemoveConfirmSheet.sheetId = "remove-confirm";

export default RemoveConfirmSheet;
