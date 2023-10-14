import * as React from "react";
import { StyleSheet, FlatList } from "react-native";
import { Link, Stack } from "expo-router";

import Text from "../../components/text";
import Option, { OptionProps } from "../../components/option";
import { Screen } from "../../components/screen";
import { useColorScheme } from "../../hooks/use-settings";
import { useSession } from "../../hooks/use-transmission";

import packageJson from "../../package.json";

type List = (OptionProps & { href: string })[]

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { data: session, error } = useSession();

  const options = React.useMemo<List>(() => {
    const connection: List = [
      {
        left: "wifi",
        label: "Connection",
        href: "/settings/connection",
        right: "chevron-right",
      },
    ];

    const serverOptions: List = [
      {
        left: "server",
        label: "Server Configuration",
        href: "/settings/server-configuration",
        right: "chevron-right",
      },
    ];

    const appOptions: List = [
      {
        left: colorScheme === "dark" ? "moon" : "sun",
        label: "Theme",
        href: "/settings/theme",
        right: "chevron-right",
      },
      {
        left: "info",
        label: "About",
        href: "/settings/about",
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
      <Stack.Screen options={{ title: "Settings", animation: "slide_from_bottom" }} />
      <FlatList
        data={options}
        renderItem={({ item: { href, ...props } }) => (
          <Link href={href} asChild>
            <Option {...props} />
          </Link>
        )}
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
