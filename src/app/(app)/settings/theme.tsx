import { FlatList, StyleSheet, useColorScheme } from "react-native";
import * as React from "react";
import * as SystemUI from "expo-system-ui";

import Option, { type OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import View from "~/components/view";
import { usePreferencesStore } from "~/hooks/use-settings";
import colors from "~/constants/colors";
import type { ColorScheme } from "~/store/settings";

export default function ThemeScreen() {
  const { colorScheme, store } = usePreferencesStore();
  const systemColorScheme = useColorScheme();

  const select = React.useCallback(
    (option: ColorScheme) => async () => {
      store({ colorScheme: option });

      let scheme = option === "system" ? systemColorScheme : option;
      if (!scheme) {
        scheme = "light";
      }

      await SystemUI.setBackgroundColorAsync(colors[scheme].background);
    },
    [store, systemColorScheme]
  );

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "smartphone",
        label: "System default",
        right: colorScheme === "system" ? "check" : undefined,
        onPress: select("system"),
        variant: "compact",
      },
      {
        left: "moon",
        label: "Dark",
        right: colorScheme === "dark" ? "check" : undefined,
        onPress: select("dark"),
        variant: "compact",
      },
      {
        left: "sun",
        label: "Light",
        right: colorScheme === "light" ? "check" : undefined,
        onPress: select("light"),
        variant: "compact",
      },
    ],
    [colorScheme, select]
  );

  const lastIndex = options.length - 1;
  const renderItem = React.useCallback(
    ({ item, index }: { item: OptionProps; index: number }) => (
      <View style={[styles.row, index === lastIndex && styles.rowLast]}>
        <Option {...item} />
      </View>
    ),
    [lastIndex]
  );

  return (
    <Screen>
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item.label}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  rowLast: {
    marginBottom: 12,
  },
});
