import * as React from "react";
import { Stack, useRouter } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";
import { useTranslation } from "react-i18next";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useScreenOptions from "~/hooks/use-screen-options";
import ActionIcon from "~/components/action-icon";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function AppLayout() {
  const opts = useScreenOptions();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack screenOptions={opts}>
          <Stack.Screen name="index" options={{ title: t("remote") }} />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: t("details"),
              headerLeft: () => (
                <ActionIcon
                  name="arrow-left"
                  onPress={() => router.dismissTo("/")}
                  style={{ paddingLeft: 0, paddingRight: 32 }}
                />
              ),
            }}
          />
          <Stack.Screen
            name="add"
            options={{
              title: t("add_torrent"),
            }}
          />
          <Stack.Screen
            name="search"
            options={{ title: t("search") }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "modal",
              title: t("pro"),
            }}
          />
          <Stack.Screen name="settings/index" options={{ title: t("settings") }} />
          <Stack.Screen
            name="settings/servers"
            options={{ title: t("servers") }}
          />
          <Stack.Screen
            name="settings/connection"
            options={{ title: t("server") }}
          />
          <Stack.Screen
            name="settings/configuration"
            options={{ title: t("server_configuration") }}
          />
          <Stack.Screen
            name="settings/security"
            options={{ title: t("security") }}
          />
          <Stack.Screen name="settings/theme" options={{ title: t("theme") }} />
          <Stack.Screen name="settings/language" options={{ title: t("language") }} />
          <Stack.Screen name="settings/about" options={{ title: t("about") }} />
          <Stack.Screen
            name="settings/pro"
            options={{ title: t("pro") }}
          />
          <Stack.Screen
            name="settings/search"
            options={{ title: t("search") }}
          />
          <Stack.Screen
            name="settings/directories"
            options={{ title: t("download_directories") }}
          />
          <Stack.Screen
            name="settings/directory"
            options={{ title: t("directory") }}
          />
          {__DEV__ && (
            <Stack.Screen
              name="settings/development"
              options={{ title: t("development") }}
            />
          )}
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
