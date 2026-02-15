import * as React from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <ActionSheet
      title={t("are_you_sure")}
      options={[
        {
          label: t("remove_torrent"),
          left: "trash",
          color: red,
          onPress: () => (ids ? remove.mutate({ ids }) : undefined),
        },
        {
          label: t("remove_and_trash"),
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
