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

declare module "react-native-actions-sheet" {
  interface Sheets {
    [TorrentActionsSheet.sheetId]: SheetDefinition<{
      payload: TorrentActionsPayload;
    }>;
    [TorrentPrioritySheet.sheetId]: SheetDefinition<{
      payload: TorrentPriorityPayload;
    }>;
    [RemoveConfirmSheet.sheetId]: SheetDefinition<{
      payload: RemoveConfirmPayload;
    }>;
    [ListingSheet.sheetId]: SheetDefinition;
    [SelectSheet.sheetId]: SheetDefinition<{
      payload: SelectPayload;
    }>;
    [ServerSelectorSheet.sheetId]: SheetDefinition;
    [ServerDeleteConfirmSheet.sheetId]: SheetDefinition<{
      payload: ServerDeleteConfirmPayload;
    }>;
    [MoveTorrentSheet.sheetId]: SheetDefinition<{
      payload: MoveTorrentPayload;
    }>;
    [SearchConfigDeleteConfirmSheet.sheetId]: SheetDefinition<{
      payload: SearchConfigDeleteConfirmPayload;
    }>;
  }
}

registerSheet(TorrentActionsSheet.sheetId, TorrentActionsSheet);
registerSheet(TorrentPrioritySheet.sheetId, TorrentPrioritySheet);
registerSheet(ListingSheet.sheetId, ListingSheet);
registerSheet(RemoveConfirmSheet.sheetId, RemoveConfirmSheet);
registerSheet(SelectSheet.sheetId, SelectSheet);
registerSheet(ServerSelectorSheet.sheetId, ServerSelectorSheet);
registerSheet(ServerDeleteConfirmSheet.sheetId, ServerDeleteConfirmSheet);
registerSheet(MoveTorrentSheet.sheetId, MoveTorrentSheet);
registerSheet(SearchConfigDeleteConfirmSheet.sheetId, SearchConfigDeleteConfirmSheet);

export {};
