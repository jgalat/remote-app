import * as React from "react";
import { FlatList } from "react-native";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";

import Option, { OptionProps } from "../../components/option";
import { Screen } from "../../components/screen";
import useSettings from "../../hooks/use-settings";
import type { ColorScheme } from "../../store/settings";

export default function ThemeScreen() {
  const router = useRouter();
  const { settings, store } = useSettings();
  const { colorScheme } = settings;

  const select = React.useCallback(
    (option: ColorScheme) => async () => {
      await store({ colorScheme: option });
      router.back();
    },
    [store, router]
  );

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "smartphone",
        label: "System default",
        right: colorScheme === "system" ? "check" : undefined,
        onPress: select("system"),
      },
      {
        left: "moon",
        label: "Dark",
        right: colorScheme === "dark" ? "check" : undefined,
        onPress: select("dark"),
      },
      {
        left: "sun",
        label: "Light",
        right: colorScheme === "light" ? "check" : undefined,
        onPress: select("light"),
      },
    ],
    [colorScheme, select]
  );

  return (
    <Screen>
      <Stack.Screen
        options={{ title: "Theme", animation: "slide_from_right" }}
      />
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
    </Screen>
  );
}
