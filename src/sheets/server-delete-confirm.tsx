import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore, useServer } from "~/hooks/use-settings";
import { SERVER_DELETE_CONFIRM_SHEET_ID } from "./ids";

export type Payload = { ids: string[]; label: string };

function ServerDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof SERVER_DELETE_CONFIRM_SHEET_ID>) {
  const { red } = useTheme();
  const { servers, store } = useServersStore();
  const active = useServer();

  const onDelete = React.useCallback(() => {
    if (!payload) return;
    const ids = new Set(payload.ids);
    const remaining = servers.filter((s) => !ids.has(s.id));
    const activeServerId = ids.has(active?.id ?? "")
      ? remaining[0]?.id
      : active?.id;
    store({ servers: remaining, activeServerId });
  }, [payload, servers, active, store]);

  return (
    <ActionSheet
      title={`Delete ${payload?.label ?? "server"}?`}
      options={[
        {
          label: "Delete",
          left: "trash",
          color: red,
          onPress: onDelete,
        },
      ]}
      {...props}
    />
  );
}

ServerDeleteConfirmSheet.sheetId = SERVER_DELETE_CONFIRM_SHEET_ID;

export default ServerDeleteConfirmSheet;
