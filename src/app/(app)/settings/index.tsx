import * as React from "react";
import { StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";

import Text from "~/components/text";
import Option, { OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import { useColorScheme, useServers } from "~/hooks/use-settings";
import { getAppVersion } from "~/utils/app-version";

import { usePro } from "@remote-app/pro";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const servers = useServers();
  const { isPro, available } = usePro();
  const router = useRouter();
  const appVersion = getAppVersion();

  const options: OptionProps[] = React.useMemo<OptionProps[]>(() => {
    const connection: OptionProps[] = [
      {
        left: "server",
        label: "Servers",
        onPress: () => router.push("/settings/servers"),
        right: "chevron-right",
      },
    ];

    const serverOptions: OptionProps[] = [
      {
        left: "sliders",
        label: "Server Configuration",
        onPress: () => router.push("/settings/configuration"),
        right: "chevron-right",
      },
      {
        left: "folder",
        label: "Download Directories",
        onPress: () => router.push("/settings/directories"),
        right: "chevron-right",
      },
      ...(available && isPro
        ? [
            {
              left: "search" as const,
              label: "Search",
              onPress: () => router.push("/settings/search"),
              right: "chevron-right" as const,
            },
          ]
        : []),
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
      ...(available
        ? [
            ...(isPro
              ? [
                  {
                    left: "download" as const,
                    label: "Configuration Backup",
                    onPress: () => router.push("/settings/backup"),
                    right: "chevron-right" as const,
                  },
                ]
              : []),
            isPro
              ? {
                  left: "star" as const,
                  label: "Pro (Active)",
                  onPress: () => router.push("/settings/pro"),
                  right: "chevron-right" as const,
                }
              : {
                  left: "star" as const,
                  label: "Pro",
                  onPress: () => router.push("/paywall"),
                  right: "chevron-right" as const,
                },
          ]
        : []),
      {
        left: "info",
        label: "About",
        onPress: () => router.push("/settings/about"),
        right: "chevron-right",
      },
    ];

    const devOptions: OptionProps[] = [
      {
        left: "code",
        label: "Development",
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
  }, [colorScheme, servers, isPro, available, router]);

  return (
    <Screen style={{ paddingTop: 16 }}>
      <FlatList
        data={options}
        renderItem={({ item }) => <Option {...item} />}
        keyExtractor={(item) => item.label}
      />
      <Text style={styles.text}>
        Version {appVersion}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: {
    textAlign: "center",
  },
});
