import * as React from "react";
import { FlatList } from "react-native";

import Option, { type OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import { usePreferencesStore } from "~/hooks/use-settings";
import type { Language } from "~/store/settings";

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hu", label: "Magyar" },
  { code: "sv", label: "Svenska" },
  { code: "pt", label: "Português" },
];

export default function LanguageScreen() {
  const { language, store } = usePreferencesStore();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(
    () =>
      languages.map(({ code, label }) => ({
        left: "globe",
        label,
        right: language === code ? "check" : undefined,
        onPress: () => store({ language: code }),
      })),
    [language, store]
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
