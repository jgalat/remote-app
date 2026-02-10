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
import SortBySheet from "./sort-by";
import FilterSheet from "./filter";
import SelectSheet, { type Payload as SelectPayload } from "./select";
import ServerSelectorSheet from "./server-selector";
import ServerDeleteConfirmSheet, {
  type Payload as ServerDeleteConfirmPayload,
} from "./server-delete-confirm";

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
    [SortBySheet.sheetId]: SheetDefinition;
    [FilterSheet.sheetId]: SheetDefinition;
    [SelectSheet.sheetId]: SheetDefinition<{
      payload: SelectPayload;
    }>;
    [ServerSelectorSheet.sheetId]: SheetDefinition;
    [ServerDeleteConfirmSheet.sheetId]: SheetDefinition<{
      payload: ServerDeleteConfirmPayload;
    }>;
  }
}

registerSheet(TorrentActionsSheet.sheetId, TorrentActionsSheet);
registerSheet(TorrentPrioritySheet.sheetId, TorrentPrioritySheet);
registerSheet(FilterSheet.sheetId, FilterSheet);
registerSheet(RemoveConfirmSheet.sheetId, RemoveConfirmSheet);
registerSheet(SortBySheet.sheetId, SortBySheet);
registerSheet(SelectSheet.sheetId, SelectSheet);
registerSheet(ServerSelectorSheet.sheetId, ServerSelectorSheet);
registerSheet(ServerDeleteConfirmSheet.sheetId, ServerDeleteConfirmSheet);

export {};
