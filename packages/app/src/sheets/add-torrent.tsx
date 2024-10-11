import * as React from "react";
import { router } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";

function AddTorrentSheet(props: SheetProps) {
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

AddTorrentSheet.sheetId = "add-torrent";

export default AddTorrentSheet;
