import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import type { Payload } from "../sheets/torrent-actions";

export function useAddTorrentSheet() {
  return React.useCallback(
    () => SheetManager.show("add-torrent"),
    [SheetManager]
  );
}

export function useTorrentActionsSheet() {
  return React.useCallback(
    (payload: Payload) =>
      SheetManager.show("torrent-actions", {
        payload
      }),
    [SheetManager]
  );
}

export function useSortBySheet() {
  return React.useCallback(() => SheetManager.show("sort-by"), [SheetManager]);
}

export function useFilterSheet() {
  return React.useCallback(() => SheetManager.show("filter"), [SheetManager]);
}
