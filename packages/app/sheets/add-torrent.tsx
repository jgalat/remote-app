import { useLinkTo } from "@react-navigation/native";

import ActionSheet, { SheetProps } from "../components/action-sheet";

export const ADD_TORRENT_SHEET_NAME = "add-torrent";

export default function (props: SheetProps) {
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
