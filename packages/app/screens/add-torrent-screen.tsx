import * as React from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Option, { OptionProps } from "../components/option";
import Screen from "../components/screen";
import { AddTorrentStackParamList } from "../types";

export default function AddTorrentScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AddTorrentStackParamList>>();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "file",
        label: "Torrent File",
        onPress: () => navigation.navigate("File"),
        right: "chevron-right",
      },
      {
        left: "link",
        label: "Magnet URL",
        onPress: () => navigation.navigate("Magnet", { magnet: undefined }),
        right: "chevron-right",
      },
    ],
    [navigation]
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
