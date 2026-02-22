import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import { useTorrentSet } from "~/hooks/torrent";
import type { TorrentId } from "~/client";

export type Payload = {
  id: TorrentId;
  content: number[];
};

const sheetId = "torrent-priority" as const;

function TorrentPrioritySheet({
  payload: { id, content = [] } = {
    id: 0,
    content: [],
  },
  ...props
}: SheetProps<typeof sheetId>) {
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

TorrentPrioritySheet.sheetId = sheetId;

export default TorrentPrioritySheet;
