import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import FilterSheet from "~/sheets/filter";
import SortBySheet from "~/sheets/sort-by";
import TorrentActionsSheet, { type Payload } from "~/sheets/torrent-actions";

export function useTorrentActionsSheet() {
  return React.useCallback(
    (payload: Payload) =>
      SheetManager.show(TorrentActionsSheet.sheetId, {
        payload,
      }),
    []
  );
}

export function useSortBySheet() {
  return React.useCallback(() => SheetManager.show(SortBySheet.sheetId), []);
}

export function useFilterSheet() {
  return React.useCallback(() => SheetManager.show(FilterSheet.sheetId), []);
}
