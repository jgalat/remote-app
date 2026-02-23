import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import { useTorrentSet } from "~/hooks/torrent";
import type { TorrentId } from "~/client";
import { TORRENT_PRIORITY_SHEET_ID } from "./ids";

export type Payload = {
  id: TorrentId;
  content: number[];
};

function TorrentPrioritySheet({
  payload: { id, content = [] } = {
    id: 0,
    content: [],
  },
  ...props
}: SheetProps<typeof TORRENT_PRIORITY_SHEET_ID>) {
  const torrentSet = useTorrentSet(id);

  const options: OptionProps[] = [
    {
      label: "High",
      left: "chevrons-up",
      onPress: () => torrentSet.mutate({ "priority-high": content }),
    },
    {
      label: "Normal",
      left: "minus",
      onPress: () => torrentSet.mutate({ "priority-normal": content }),
    },
    {
      label: "Low",
      left: "chevrons-down",
      onPress: () => torrentSet.mutate({ "priority-low": content }),
    },
  ];

  return <ActionSheet title="Priority" options={options} {...props} />;
}

TorrentPrioritySheet.sheetId = TORRENT_PRIORITY_SHEET_ID;

export default TorrentPrioritySheet;
