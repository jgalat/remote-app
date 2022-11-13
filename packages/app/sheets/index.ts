import { registerSheet } from "react-native-actions-sheet";

import AddTorrentSheet from "./add-torrent";
import TorrentActionsSheet from "./torrent-actions";
import RemoveConfirmSheet from "./remove-confirm";
import SortBySheet from "./sort-by";
import FilterSheet from "./filter";

registerSheet("add-torrent", AddTorrentSheet);
registerSheet("torrent-actions", TorrentActionsSheet);
registerSheet("remove-confirm", RemoveConfirmSheet);
registerSheet("sort-by", SortBySheet);
registerSheet("filter", FilterSheet);

export {};
