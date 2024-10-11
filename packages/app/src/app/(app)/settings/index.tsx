import * as React from "react";
import { StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";

import Text from "~/components/text";
import Option, { OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import { useColorScheme } from "~/hooks/use-settings";
import { useSession } from "~/hooks/use-transmission";

import packageJson from "~/../package.json";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { data: session, error } = useSession({ stale: true });

  const options: OptionProps[] = React.useMemo<OptionProps[]>(() => {
    const connection: OptionProps[] = [
      {
        left: "wifi",
        label: "Connection",
        onPress: () => router.push("/settings/connection"),
        right: "chevron-right",
      },
    ];

    const serverOptions: OptionProps[] = [
      {
        left: "server",
        label: "Server Configuration",
        onPress: () => router.push("/settings/configuration"),
        right: "chevron-right",
      },
    ];

    const appOptions: OptionProps[] = [
      {
        left: "lock",
        label: "Security",
        onPress: () => router.push("/settings/security"),
        right: "chevron-right",
      },
      {
        left: colorScheme === "dark" ? "moon" : "sun",
        label: "Theme",
        onPress: () => router.push("/settings/theme"),
        right: "chevron-right",
      },
      {
        left: "info",
        label: "About",
        onPress: () => router.push("/settings/about"),
        right: "chevron-right",
      },
    ];

    return [
      ...connection,
      ...(!session || error ? [] : serverOptions),
      ...appOptions,
    ];
  }, [colorScheme, session, error]);

  return (
    <Screen>
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
      <Text style={styles.text}>Version {packageJson.version}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
});
