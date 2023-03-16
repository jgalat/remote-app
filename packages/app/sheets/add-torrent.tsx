import * as React from "react";
import { useLinkTo } from "@react-navigation/native";

import ActionSheet, { SheetProps } from "../components/action-sheet";

function AddTorrentSheet(props: SheetProps) {
  const linkTo = useLinkTo();
  return (
    <ActionSheet
      title="Add a torrent"
      options={[
        {
          label: "File",
          left: "file",
          onPress: () => linkTo("/add-file"),
        },
        {
          label: "Magnet URL",
          left: "link",
          onPress: () => linkTo("/add-magnet"),
        },
      ]}
      {...props}
    />
  );
}

AddTorrentSheet.sheetId = "add-torrent";

export default AddTorrentSheet;
