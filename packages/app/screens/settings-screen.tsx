import * as React from "react";
import { FlatList } from "react-native";

import Option, { OptionProps } from "../components/option";
import { useColorScheme } from "../hooks/use-settings";
import { SettingsStackScreenProps } from "../types";

import { Screen } from "../components/themed";

export default function SettingsScreen({
  navigation,
}: SettingsStackScreenProps<"Settings">) {
  const colorScheme = useColorScheme();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "server",
        label: "Configure server",
        onPress: () => navigation.navigate("Server"),
        right: "chevron-right",
      },
      {
        left: colorScheme === "dark" ? "moon" : "sun",
        label: "Theme",
        onPress: () => navigation.navigate("Theme"),
        right: "chevron-right",
      },
    ],
    [navigation, colorScheme]
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
