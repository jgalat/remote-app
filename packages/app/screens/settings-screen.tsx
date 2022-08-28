import * as React from "react";
import { StyleSheet } from "react-native";
import { FlatList } from "react-native";
import { useLinkTo } from "@react-navigation/native";

import Text from "../components/text";
import Option, { OptionProps } from "../components/option";
import Screen from "../components/screen";
import { useColorScheme } from "../hooks/use-settings";
import { useSession } from "../hooks/use-transmission";
import { useTheme } from "../hooks/use-theme-color";

import json from "../package.json";

export default function SettingsScreen() {
  const linkTo = useLinkTo();
  const colorScheme = useColorScheme();
  const { gray } = useTheme();
  const { data: session, error } = useSession();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "wifi",
        label: "Connection",
        onPress: () => linkTo("/settings/connection"),
        right: "chevron-right",
      },
      {
        left: "server",
        label: "Server Configuration",
        onPress: () => linkTo("/settings/theme"),
        right: "chevron-right",
        disabled: !session || error,
      },
      {
        left: colorScheme === "dark" ? "moon" : "sun",
        label: "Theme",
        onPress: () => linkTo("/settings/theme"),
        right: "chevron-right",
      },
    ],
    [linkTo, colorScheme, session, error]
  );

  return (
    <Screen>
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
      <Text color={gray} style={styles.text}>
        Version {json.version}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
});
