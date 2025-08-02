import * as React from "react";
import { useRouter } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";

const sheetId = "add-torrent" as const;

function AddTorrentSheet(props: SheetProps<typeof sheetId>) {
  const router = useRouter();
  return (
    <ActionSheet
      title="Add a torrent"
      options={[
        {
          label: "File",
          left: "file",
          onPress: () => router.push("/add/file"),
        },
        {
          label: "Magnet URL",
          left: "link",
          onPress: () => router.push("/add/magnet"),
        },
      ]}
      {...props}
    />
  );
}

AddTorrentSheet.sheetId = sheetId;

export default AddTorrentSheet;
