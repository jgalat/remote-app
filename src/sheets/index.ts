import { registerSheet, SheetDefinition } from "react-native-actions-sheet";

import AddTorrentSheet from "./add-torrent";
import TorrentActionsSheet, {
  type Payload as TorrentActionsPayload,
} from "./torrent-actions";
import RemoveConfirmSheet, {
  type Payload as RemoveConfirmPayload,
} from "./remove-confirm";
import SortBySheet from "./sort-by";
import FilterSheet from "./filter";

declare module "react-native-actions-sheet" {
  interface Sheets {
    [AddTorrentSheet.sheetId]: SheetDefinition;
    [TorrentActionsSheet.sheetId]: SheetDefinition<{
      payload: TorrentActionsPayload;
    }>;
    [RemoveConfirmSheet.sheetId]: SheetDefinition<{
      payload: RemoveConfirmPayload;
    }>;
    [SortBySheet.sheetId]: SheetDefinition;
    [FilterSheet.sheetId]: SheetDefinition;
  }
}

registerSheet(AddTorrentSheet.sheetId, AddTorrentSheet);
registerSheet(TorrentActionsSheet.sheetId, TorrentActionsSheet);
registerSheet(RemoveConfirmSheet.sheetId, RemoveConfirmSheet);
registerSheet(SortBySheet.sheetId, SortBySheet);
registerSheet(FilterSheet.sheetId, FilterSheet);

export {};
