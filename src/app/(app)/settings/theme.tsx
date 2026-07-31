import { SectionList, StyleSheet, useColorScheme } from "react-native";
import * as React from "react";
import * as SystemUI from "expo-system-ui";

import Option, { type OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import View from "~/components/view";
import { SettingsSectionTitle } from "~/components/settings";
import { usePreferencesStore } from "~/hooks/use-settings";
import colors from "~/constants/colors";
import type { ColorScheme } from "~/store/settings";
import type { FontFamily } from "~/store/settings";

export default function ThemeScreen() {
  const { colorScheme, fontFamily, store } = usePreferencesStore();
  const systemColorScheme = useColorScheme();

  const select = React.useCallback(
    (option: ColorScheme) => async () => {
      store({ colorScheme: option });

      let scheme = option === "system" ? systemColorScheme : option;
      if (scheme !== "light" && scheme !== "dark") {
        scheme = "light";
      }

      await SystemUI.setBackgroundColorAsync(colors[scheme].background);
    },
    [store, systemColorScheme]
  );

  const selectFont = React.useCallback(
    (option: FontFamily) => () => store({ fontFamily: option }),
    [store],
  );

  const sections = React.useMemo<
    { key: "appearance" | "typography"; title: string; data: OptionProps[] }[]
  >(
    () => [
      {
        key: "appearance",
        title: "Appearance",
        data: [
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
      },
      {
        key: "typography",
        title: "Typography",
        data: [
          {
            left: "type",
            label: "System font",
            right: fontFamily === "system" ? "check" : undefined,
            onPress: selectFont("system"),
            variant: "compact",
          },
          {
            left: "code",
            label: "Monospace font",
            right: fontFamily === "mono" ? "check" : undefined,
            onPress: selectFont("mono"),
            variant: "compact",
          },
        ],
      },
    ],
    [colorScheme, fontFamily, select, selectFont]
  );

  return (
    <Screen style={styles.screen}>
      <SectionList
        sections={sections}
        renderItem={({ item, index, section }) => (
          <View
            style={[
              styles.row,
              index === section.data.length - 1 && styles.rowLast,
            ]}
          >
            <Option {...item} />
          </View>
        )}
        keyExtractor={(item) => item.label}
        renderSectionHeader={({ section }) => (
          <SettingsSectionTitle
            title={section.title}
            variant="settings"
            first={section.key === "appearance"}
          />
        )}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 8,
  },
  row: {
    marginBottom: 8,
  },
  rowLast: {
    marginBottom: 12,
  },
});
