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
    [FilterSheet.sheetId]: SheetDefinition;
  }
}

registerSheet(TorrentActionsSheet.sheetId, TorrentActionsSheet);
registerSheet(TorrentPrioritySheet.sheetId, TorrentPrioritySheet);
registerSheet(RemoveConfirmSheet.sheetId, RemoveConfirmSheet);
registerSheet(SortBySheet.sheetId, SortBySheet);
registerSheet(FilterSheet.sheetId, FilterSheet);

export {};
