import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import ListingSheet from "~/sheets/listing";
import TorrentActionsSheet, {
  type Payload as TorrentActionsPayload,
} from "~/sheets/torrent-actions";
import TorrentPrioritySheet, {
  type Payload as TorrentPriorityPayload,
} from "~/sheets/torrent-priority";
import ServerSelectorSheet from "~/sheets/server-selector";
import ServerDeleteConfirmSheet, {
  type Payload as ServerDeleteConfirmPayload,
} from "~/sheets/server-delete-confirm";
import SearchConfigDeleteConfirmSheet, {
  type Payload as SearchConfigDeleteConfirmPayload,
} from "~/sheets/search-config-delete-confirm";

export function useTorrentActionsSheet() {
  return React.useCallback(
    (payload: TorrentActionsPayload) =>
      SheetManager.show(TorrentActionsSheet.sheetId, {
        payload,
      }),
    []
  );
}

export function useTorrentPrioritySheet(id: number | string) {
  return React.useCallback(
    (payload: Pick<TorrentPriorityPayload, "content">) =>
      SheetManager.show(TorrentPrioritySheet.sheetId, {
        payload: { id, ...payload },
      }),
    [id]
  );
}

export function useListingSheet() {
  return React.useCallback(() => SheetManager.show(ListingSheet.sheetId), []);
}

export function useServerSelectorSheet() {
  return React.useCallback(
    () => SheetManager.show(ServerSelectorSheet.sheetId),
    []
  );
}

export function useServerDeleteConfirmSheet() {
  return React.useCallback(
    (payload: ServerDeleteConfirmPayload) =>
      SheetManager.show(ServerDeleteConfirmSheet.sheetId, { payload }),
    []
  );
}

export function useSearchConfigDeleteConfirmSheet() {
  return React.useCallback(
    (payload: SearchConfigDeleteConfirmPayload) =>
      SheetManager.show(SearchConfigDeleteConfirmSheet.sheetId, { payload }),
    []
  );
}
