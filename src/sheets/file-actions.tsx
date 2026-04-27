import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import type { TorrentId } from "~/client";
import {
  FILE_ACTIONS_SHEET_ID,
  RENAME_PATH_SHEET_ID,
  TORRENT_PRIORITY_SHEET_ID,
} from "./ids";

export type Payload = {
  id: TorrentId;
  path: string;
  name: string;
  isFile: boolean;
  content: number[];
};

function FileActionsSheet({
  payload,
  ...props
}: SheetProps<typeof FILE_ACTIONS_SHEET_ID>) {
  const id = payload?.id ?? 0;
  const path = payload?.path ?? "";
  const name = payload?.name ?? "";
  const isFile = payload?.isFile ?? true;
  const content = payload?.content ?? [];

  const options: OptionProps[] = [
    {
      label: "Set priority",
      left: "bar-chart-2",
      onPress: () => {
        setTimeout(
          () =>
            SheetManager.show(TORRENT_PRIORITY_SHEET_ID, {
              payload: { id, content },
            }),
          100
        );
      },
    },
    {
      label: "Rename",
      left: "edit-2",
      onPress: () => {
        setTimeout(
          () =>
            SheetManager.show(RENAME_PATH_SHEET_ID, {
              payload: {
                id,
                path,
                currentName: name,
                kind: isFile ? "file" : "folder",
              },
            }),
          100
        );
      },
    },
  ];

  return <ActionSheet title={name} options={options} {...props} />;
}

FileActionsSheet.sheetId = FILE_ACTIONS_SHEET_ID;

export default FileActionsSheet;
