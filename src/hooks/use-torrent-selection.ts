import { TorrentSelectionContext } from "~/contexts/torrent-selection";
import useNonNullContext from "./use-non-null-context";

export default function useTorrentSelection() {
  return useNonNullContext(TorrentSelectionContext);
}
