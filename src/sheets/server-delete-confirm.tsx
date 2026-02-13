import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore, useServer } from "~/hooks/use-settings";

export type Payload = { ids: string[]; label: string };

const sheetId = "server-delete-confirm" as const;

function ServerDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof sheetId>) {
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

ServerDeleteConfirmSheet.sheetId = sheetId;

export default ServerDeleteConfirmSheet;
