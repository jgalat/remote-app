import * as React from "react";
import { ToastAndroid } from "react-native";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore } from "~/hooks/use-settings";
import { useRemoveLocalServer, LOCAL_SERVER_ID } from "@remote-app/pro";
import { removeServersById } from "~/utils/server-deletion";
import { SERVER_DELETE_CONFIRM_SHEET_ID } from "./ids";

export type Payload = { ids: string[]; label: string };

function ServerDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof SERVER_DELETE_CONFIRM_SHEET_ID>) {
  const { red } = useTheme();
  const { servers, activeServerId, store } = useServersStore();
  const { mutate: removeLocal } = useRemoveLocalServer();

  const onDelete = React.useCallback(() => {
    if (!payload) return;
    const ids = new Set(payload.ids);
    const updated = removeServersById({ servers, activeServerId }, ids);

    store(updated, {
      onSuccess: () => {
        if (!ids.has(LOCAL_SERVER_ID)) return;
        removeLocal(undefined, {
          onError: () =>
            ToastAndroid.show(
              "Failed to clean up local engine",
              ToastAndroid.SHORT,
            ),
        });
      },
    });
  }, [payload, servers, activeServerId, store, removeLocal]);

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
