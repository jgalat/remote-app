import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import FilterSheet from "~/sheets/filter";
import SortBySheet from "~/sheets/sort-by";
import TorrentActionsSheet, {
  type Payload as TorrentActionsPayload,
} from "~/sheets/torrent-actions";
import TorrentPrioritySheet, {
  type Payload as TorrentPriorityPayload,
} from "~/sheets/torrent-priority";

export function useTorrentActionsSheet() {
  return React.useCallback(
    (payload: TorrentActionsPayload) =>
      SheetManager.show(TorrentActionsSheet.sheetId, {
        payload,
      }),
    []
  );
}

export function useTorrentPrioritySheet(id: number) {
  return React.useCallback(
    (payload: Pick<TorrentPriorityPayload, "content">) =>
      SheetManager.show(TorrentPrioritySheet.sheetId, {
        payload: { id, ...payload },
      }),
    [id]
  );
}

export function useSortBySheet() {
  return React.useCallback(() => SheetManager.show(SortBySheet.sheetId), []);
}

export function useFilterSheet() {
  return React.useCallback(() => SheetManager.show(FilterSheet.sheetId), []);
}
