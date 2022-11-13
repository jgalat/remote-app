import { registerSheet } from "react-native-actions-sheet";

import AddTorrentSheet, { ADD_TORRENT_SHEET_NAME } from "./add-torrent";
import TorrentActionsSheet, {
  TORRENT_ACTIONS_SHEET_NAME,
} from "./torrent-actions";
import RemoveConfirmSheet, {
  REMOVE_CONFIRM_SHEET_NAME,
} from "./remove-confirm";
import SortBySheet, { SORT_BY_SHEET_NAME } from "./sort-by";
import FilterSheet, { FILTER_SHEET_NAME } from "./filter";

registerSheet(ADD_TORRENT_SHEET_NAME, AddTorrentSheet);
registerSheet(TORRENT_ACTIONS_SHEET_NAME, TorrentActionsSheet);
registerSheet(REMOVE_CONFIRM_SHEET_NAME, RemoveConfirmSheet);
registerSheet(SORT_BY_SHEET_NAME, SortBySheet);
registerSheet(FILTER_SHEET_NAME, FilterSheet);

export {};
