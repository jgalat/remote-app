import { registerSheet, SheetDefinition } from "react-native-actions-sheet";

import TorrentActionsSheet, {
  type Payload as TorrentActionsPayload,
} from "./torrent-actions";
import TorrentPrioritySheet, {
  type Payload as TorrentPriorityPayload,
} from "./torrent-priority";
import RemoveConfirmSheet, {
  type Payload as RemoveConfirmPayload,
} from "./remove-confirm";
import ListingSheet from "./listing";
import SelectSheet, { type Payload as SelectPayload } from "./select";
import ServerSelectorSheet from "./server-selector";
import ServerDeleteConfirmSheet, {
  type Payload as ServerDeleteConfirmPayload,
} from "./server-delete-confirm";
import MoveTorrentSheet, {
  type Payload as MoveTorrentPayload,
} from "./move-torrent";
import SearchConfigDeleteConfirmSheet, {
  type Payload as SearchConfigDeleteConfirmPayload,
} from "./search-config-delete-confirm";
import {
  LISTING_SHEET_ID,
  MOVE_TORRENT_SHEET_ID,
  REMOVE_CONFIRM_SHEET_ID,
  SEARCH_CONFIG_DELETE_CONFIRM_SHEET_ID,
  SELECT_SHEET_ID,
  SERVER_DELETE_CONFIRM_SHEET_ID,
  SERVER_SELECTOR_SHEET_ID,
  TORRENT_ACTIONS_SHEET_ID,
  TORRENT_PRIORITY_SHEET_ID,
} from "./ids";

declare module "react-native-actions-sheet" {
  interface Sheets {
    [TORRENT_ACTIONS_SHEET_ID]: SheetDefinition<{
      payload: TorrentActionsPayload;
    }>;
    [TORRENT_PRIORITY_SHEET_ID]: SheetDefinition<{
      payload: TorrentPriorityPayload;
    }>;
    [REMOVE_CONFIRM_SHEET_ID]: SheetDefinition<{
      payload: RemoveConfirmPayload;
    }>;
    [LISTING_SHEET_ID]: SheetDefinition;
    [SELECT_SHEET_ID]: SheetDefinition<{
      payload: SelectPayload;
    }>;
    [SERVER_SELECTOR_SHEET_ID]: SheetDefinition;
    [SERVER_DELETE_CONFIRM_SHEET_ID]: SheetDefinition<{
      payload: ServerDeleteConfirmPayload;
    }>;
    [MOVE_TORRENT_SHEET_ID]: SheetDefinition<{
      payload: MoveTorrentPayload;
    }>;
    [SEARCH_CONFIG_DELETE_CONFIRM_SHEET_ID]: SheetDefinition<{
      payload: SearchConfigDeleteConfirmPayload;
    }>;
  }
}

registerSheet(TORRENT_ACTIONS_SHEET_ID, TorrentActionsSheet);
registerSheet(TORRENT_PRIORITY_SHEET_ID, TorrentPrioritySheet);
registerSheet(LISTING_SHEET_ID, ListingSheet);
registerSheet(REMOVE_CONFIRM_SHEET_ID, RemoveConfirmSheet);
registerSheet(SELECT_SHEET_ID, SelectSheet);
registerSheet(SERVER_SELECTOR_SHEET_ID, ServerSelectorSheet);
registerSheet(SERVER_DELETE_CONFIRM_SHEET_ID, ServerDeleteConfirmSheet);
registerSheet(MOVE_TORRENT_SHEET_ID, MoveTorrentSheet);
registerSheet(SEARCH_CONFIG_DELETE_CONFIRM_SHEET_ID, SearchConfigDeleteConfirmSheet);

export {};
