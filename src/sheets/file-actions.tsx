import * as React from "react";
import { SheetManager } from "react-native-actions-sheet";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import type { TorrentId } from "~/client";
import { useIsLocalServer } from "~/hooks/use-settings";
import {
  useCopyLocalFileToDownloads,
  useOpenLocalFile,
  useShareLocalFile,
} from "@remote-app/pro";
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
  const isLocal = useIsLocalServer();
  const copyLocalFileToDownloads = useCopyLocalFileToDownloads();
  const openLocalFile = useOpenLocalFile();
  const shareLocalFile = useShareLocalFile();

  const options: OptionProps[] = [
    ...(isLocal && isFile && content.length === 1
      ? [
          {
            label: "Open",
            left: "external-link" as const,
            onPress: () =>
              openLocalFile.mutate({
                infoHash: String(id),
                fileIndex: content[0],
              }),
          },
          {
            label: "Copy to Downloads",
            left: "download" as const,
            onPress: () =>
              copyLocalFileToDownloads.mutate({
                infoHash: String(id),
                fileIndex: content[0],
              }),
          },
          {
            label: "Share",
            left: "share" as const,
            onPress: () =>
              shareLocalFile.mutate({
                infoHash: String(id),
                fileIndex: content[0],
              }),
          },
        ]
      : []),
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
    // Rename isn't reliable on the local libtorrent4j engine — torrent_info
    // doesn't reflect renames in 2.x, and rename info doesn't survive
    // resume-data round trips, so a restart re-downloads under the original
    // name. Hidden for local servers; remote (Transmission/qBittorrent)
    // continues to expose it.
    ...(isLocal
      ? []
      : [
          {
            label: "Rename",
            left: "edit-2" as const,
            onPress: () => {
              setTimeout(
                () =>
                  SheetManager.show(RENAME_PATH_SHEET_ID, {
                    payload: {
                      id,
                      path,
                      currentName: name,
                      kind: isFile ? ("file" as const) : ("folder" as const),
                    },
                  }),
                100,
              );
            },
          },
        ]),
  ];

  return <ActionSheet options={options} {...props} />;
}

FileActionsSheet.sheetId = FILE_ACTIONS_SHEET_ID;

export default FileActionsSheet;
