import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useTorrentAction, Torrent } from "~/hooks/transmission";

export type Payload = Torrent["id"][];

const sheetId = "remove-confirm" as const;

function RemoveConfirmSheet({
  payload: ids,
  ...props
}: SheetProps<typeof sheetId>) {
  const { red } = useTheme();
  const remove = useTorrentAction("torrent-remove");

  return (
    <ActionSheet
      title="Are you sure?"
      options={[
        {
          label: "Remove",
          left: "trash",
          color: red,
          onPress: () => (ids ? remove.mutate({ ids }) : undefined),
        },
        {
          label: "Remove & Trash data",
          left: "trash-2",
          color: red,
          onPress: () =>
            ids
              ? remove.mutate({ ids, "delete-local-data": true })
              : undefined,
        },
      ]}
      {...props}
    />
  );
}

RemoveConfirmSheet.sheetId = sheetId;

export default RemoveConfirmSheet;
