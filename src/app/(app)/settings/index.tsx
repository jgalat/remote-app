import * as React from "react";
import * as Application from "expo-application";
import { StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import Text from "~/components/text";
import Option, { OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import { useColorScheme, useServers } from "~/hooks/use-settings";

import { usePro } from "@remote-app/pro";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const servers = useServers();
  const { isPro, available } = usePro();
  const router = useRouter();
  const { t } = useTranslation();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(() => {
    const connection: OptionProps[] = [
      {
        left: "server",
        label: t("servers"),
        onPress: () => router.push("/settings/servers"),
        right: "chevron-right",
      },
    ];

    const serverOptions: OptionProps[] = [
      {
        left: "sliders",
        label: t("server_configuration"),
        onPress: () => router.push("/settings/configuration"),
        right: "chevron-right",
      },
      {
        left: "folder",
        label: t("download_directories"),
        onPress: () => router.push("/settings/directories"),
        right: "chevron-right",
      },
      ...(available && isPro
        ? [
            {
              left: "search" as const,
              label: t("search"),
              onPress: () => router.push("/settings/search"),
              right: "chevron-right" as const,
            },
          ]
        : []),
    ];

    const appOptions: OptionProps[] = [
      {
        left: "lock",
        label: t("security"),
        onPress: () => router.push("/settings/security"),
        right: "chevron-right",
      },
      {
        left: colorScheme === "dark" ? "moon" : "sun",
        label: t("theme"),
        onPress: () => router.push("/settings/theme"),
        right: "chevron-right",
      },
      {
        left: "globe",
        label: t("language"),
        onPress: () => router.push("/settings/language"),
        right: "chevron-right",
      },
      ...(available
        ? [
            isPro
              ? {
                  left: "star" as const,
                  label: t("pro_active"),
                  onPress: () => router.push("/settings/pro"),
                  right: "chevron-right" as const,
                }
              : {
                  left: "star" as const,
                  label: t("pro"),
                  onPress: () => router.push("/paywall"),
                  right: "chevron-right" as const,
                },
          ]
        : []),
      {
        left: "info",
        label: t("about"),
        onPress: () => router.push("/settings/about"),
        right: "chevron-right",
      },
    ];

    const devOptions: OptionProps[] = [
      {
        left: "code",
        label: t("development"),
        onPress: () => router.push("/settings/development"),
        right: "chevron-right",
      },
    ];

    return [
      ...connection,
      ...(servers.length > 0 ? serverOptions : []),
      ...appOptions,
      ...(__DEV__ ? devOptions : []),
    ];
  }, [colorScheme, servers, isPro, available, router, t]);

  return (
    <Screen style={{ paddingTop: 16 }}>
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
      <Text style={styles.text}>
        {t("version", { version: Application.nativeApplicationVersion })}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
});
