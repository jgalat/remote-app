import * as React from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Option, { OptionProps } from "../components/option";
import Screen from "../components/screen";
import { useColorScheme, useServer } from "../hooks/use-settings";
import { SettingsStackParamList } from "../types";

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const colorScheme = useColorScheme();
  const server = useServer();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "wifi",
        label: "Connection",
        onPress: () => navigation.navigate("ConnectionSetup"),
        right: "chevron-right",
      },
      {
        left: "server",
        label: "Server Configuration",
        onPress: () => navigation.navigate("Theme"),
        right: "chevron-right",
        disabled: !server,
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
