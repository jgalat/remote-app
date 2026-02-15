import * as React from "react";
import { useTranslation } from "react-i18next";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import { useTorrentSet } from "~/hooks/transmission";

export type Payload = {
  id: number;
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
  const { t } = useTranslation();

  const options: OptionProps[] = [
    {
      label: t("high"),
      left: "chevrons-up",
      onPress: () => torrentSet.mutate({ "priority-high": content }),
    },
    {
      label: t("normal"),
      left: "minus",
      onPress: () => torrentSet.mutate({ "priority-normal": content }),
    },
    {
      label: t("low"),
      left: "chevrons-down",
      onPress: () => torrentSet.mutate({ "priority-low": content }),
    },
  ];

  return <ActionSheet title={t("priority")} options={options} {...props} />;
}

TorrentPrioritySheet.sheetId = sheetId;

export default TorrentPrioritySheet;
