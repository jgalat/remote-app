import { registerSheet } from "react-native-actions-sheet";

import AddTorrentSheet from "./add-torrent";
import TorrentActionsSheet from "./torrent-actions";
import RemoveConfirmSheet from "./remove-confirm";
import SortBySheet from "./sort-by";
import FilterSheet from "./filter";

registerSheet(AddTorrentSheet.sheetId, AddTorrentSheet);
registerSheet(TorrentActionsSheet.sheetId, TorrentActionsSheet);
registerSheet(RemoveConfirmSheet.sheetId, RemoveConfirmSheet);
registerSheet(SortBySheet.sheetId, SortBySheet);
registerSheet(FilterSheet.sheetId, FilterSheet);

export {};
