import { FlatList, useColorScheme } from "react-native";
import * as React from "react";
import * as SystemUI from "expo-system-ui";
import { useTranslation } from "react-i18next";

import Option, { type OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import { usePreferencesStore } from "~/hooks/use-settings";
import colors from "~/constants/colors";
import type { ColorScheme } from "~/store/settings";

export default function ThemeScreen() {
  const { colorScheme, store } = usePreferencesStore();
  const systemColorScheme = useColorScheme();
  const { t } = useTranslation();

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
        label: t("system_default"),
        right: colorScheme === "system" ? "check" : undefined,
        onPress: select("system"),
      },
      {
        left: "moon",
        label: t("dark"),
        right: colorScheme === "dark" ? "check" : undefined,
        onPress: select("dark"),
      },
      {
        left: "sun",
        label: t("light"),
        right: colorScheme === "light" ? "check" : undefined,
        onPress: select("light"),
      },
    ],
    [colorScheme, select, t]
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
