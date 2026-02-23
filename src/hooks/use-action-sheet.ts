import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import type { Payload as TorrentActionsPayload } from "~/sheets/torrent-actions";
import type { Payload as TorrentPriorityPayload } from "~/sheets/torrent-priority";
import type { Payload as ServerDeleteConfirmPayload } from "~/sheets/server-delete-confirm";
import type { Payload as SearchConfigDeleteConfirmPayload } from "~/sheets/search-config-delete-confirm";
import {
  LISTING_SHEET_ID,
  SEARCH_CONFIG_DELETE_CONFIRM_SHEET_ID,
  SERVER_DELETE_CONFIRM_SHEET_ID,
  SERVER_SELECTOR_SHEET_ID,
  TORRENT_ACTIONS_SHEET_ID,
  TORRENT_PRIORITY_SHEET_ID,
} from "~/sheets/ids";

export function useTorrentActionsSheet() {
  return React.useCallback(
    (payload: TorrentActionsPayload) =>
      SheetManager.show(TORRENT_ACTIONS_SHEET_ID, {
        payload,
      }),
    []
  );
}

export function useTorrentPrioritySheet(id: number | string) {
  return React.useCallback(
    (payload: Pick<TorrentPriorityPayload, "content">) =>
      SheetManager.show(TORRENT_PRIORITY_SHEET_ID, {
        payload: { id, ...payload },
      }),
    [id]
  );
}

export function useListingSheet() {
  return React.useCallback(() => SheetManager.show(LISTING_SHEET_ID), []);
}

export function useServerSelectorSheet() {
  return React.useCallback(() => SheetManager.show(SERVER_SELECTOR_SHEET_ID), []);
}

export function useServerDeleteConfirmSheet() {
  return React.useCallback(
    (payload: ServerDeleteConfirmPayload) =>
      SheetManager.show(SERVER_DELETE_CONFIRM_SHEET_ID, { payload }),
    []
  );
}

export function useSearchConfigDeleteConfirmSheet() {
  return React.useCallback(
    (payload: SearchConfigDeleteConfirmPayload) =>
      SheetManager.show(SEARCH_CONFIG_DELETE_CONFIRM_SHEET_ID, { payload }),
    []
  );
}
