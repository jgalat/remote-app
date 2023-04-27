import * as React from "react";
import { Torrent } from "@remote-app/transmission-client";

import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTheme } from "../hooks/use-theme-color";
import useTorrentSelection from "../hooks/use-torrent-selection";
import { useTorrentAction } from "../hooks/use-transmission";

function RemoveConfirmSheet({
  payload: ids,
  ...props
}: SheetProps<Torrent["id"][]>) {
  const { red } = useTheme();
  const remove = useTorrentAction("torrent-remove");
  const { clear } = useTorrentSelection();

  return (
    <ActionSheet
      title="Are you sure?"
      options={[
        {
          label: "Remove",
          left: "trash",
          color: red,
          onPress: () => {
            remove.mutate({ ids }, { onSettled: clear });
          },
        },
        {
          label: "Remove & Trash data",
          left: "trash-2",
          color: red,
          onPress: () => {
            remove.mutate(
              { ids, "delete-local-data": true },
              { onSettled: clear }
            );
          },
        },
      ]}
      {...props}
    />
  );
}

RemoveConfirmSheet.sheetId = "remove-confirm";

export default RemoveConfirmSheet;
