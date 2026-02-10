import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import useSettings from "~/hooks/use-settings";
import { getActiveServer } from "~/store/settings";

export type Payload = { id: string; name: string };

const sheetId = "server-delete-confirm" as const;

function ServerDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof sheetId>) {
  const { red } = useTheme();
  const { settings, store } = useSettings();

  const onDelete = React.useCallback(() => {
    if (!payload) return;
    const servers = settings.servers.filter((s) => s.id !== payload.id);
    const active = getActiveServer(settings);
    const activeServerId =
      active?.id === payload.id ? servers[0]?.id : active?.id;
    store({ servers, activeServerId });
  }, [payload, settings, store]);

  return (
    <ActionSheet
      title={`Delete ${payload?.name ?? "server"}?`}
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
