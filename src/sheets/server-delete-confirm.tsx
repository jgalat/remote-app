import * as React from "react";
import { ToastAndroid } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useServersStore, useServer } from "~/hooks/use-settings";
import { useRemoveLocalServer, LOCAL_SERVER_ID } from "@remote-app/pro";
import { cleanupOrphanedData } from "~/store/cleanup";
import { loadDirectories } from "~/store/directories";
import { SERVER_DELETE_CONFIRM_SHEET_ID } from "./ids";

export type Payload = { ids: string[]; label: string };

function ServerDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof SERVER_DELETE_CONFIRM_SHEET_ID>) {
  const { red } = useTheme();
  const { servers, store } = useServersStore();
  const active = useServer();
  const { mutate: removeLocal } = useRemoveLocalServer();
  const queryClient = useQueryClient();

  const onDelete = React.useCallback(() => {
    if (!payload) return;
    const ids = new Set(payload.ids);
    // Removing the local server takes a different path — it stops the engine,
    // wipes persisted engine state, and clears the JS-side engine settings.
    // Doing this through `store({ servers: ... })` alone leaves a running
    // service and stale MMKV settings (custom downloadDir, etc.).
    if (ids.has(LOCAL_SERVER_ID)) {
      removeLocal(undefined, {
        onError: () =>
          ToastAndroid.show("Failed to clean up local engine", ToastAndroid.SHORT),
      });
      ids.delete(LOCAL_SERVER_ID);
      if (ids.size === 0) {
        // Local-server-only delete bypasses useServersStore.store, so the
        // per-server directories and notifier state never get pruned.
        // Compute the new server-id set from the in-memory `servers` list
        // minus the local id, prune MMKV, then push the fresh value into
        // the directories query cache so the Directories screen rerenders.
        cleanupOrphanedData(
          new Set(
            servers
              .filter((s) => s.id !== LOCAL_SERVER_ID)
              .map((s) => s.id),
          ),
        );
        queryClient.setQueryData(["settings", "directories"], loadDirectories());
        return;
      }
    }
    const remaining = servers.filter((s) => !ids.has(s.id));
    const activeServerId = ids.has(active?.id ?? "")
      ? remaining[0]?.id
      : active?.id;
    store({ servers: remaining, activeServerId });
  }, [payload, servers, active, store, removeLocal, queryClient]);

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
