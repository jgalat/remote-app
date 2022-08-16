import * as React from "react";
import { FlatList } from "react-native";
import { useLinkTo } from "@react-navigation/native";

import Option, { OptionProps } from "../components/option";
import Screen from "../components/screen";

export default function AddTorrentScreen() {
  const linkTo = useLinkTo();
  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "file",
        label: "Torrent File",
        onPress: () => linkTo("/add/file"),
        right: "chevron-right",
      },
      {
        left: "link",
        label: "Magnet URL",
        onPress: () => linkTo("/add/magnet"),
        right: "chevron-right",
      },
    ],
    [linkTo]
  );

  return (
    <Screen>
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
    </Screen>
  );
}
