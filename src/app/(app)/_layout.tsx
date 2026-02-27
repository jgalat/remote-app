import * as React from "react";
import { Stack, useRouter } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useScreenOptions from "~/hooks/use-screen-options";
import ActionIcon from "~/components/action-icon";
import { usePro } from "@remote-app/pro";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function AppLayout() {
  const opts = useScreenOptions();
  const router = useRouter();
  const { available, isPro } = usePro();

  return (
    <TorrentSelectionProvider>
      <SheetProvider>
        <Stack screenOptions={opts}>
          <Stack.Screen name="index" options={{ title: "Remote" }} />
          <Stack.Screen
            name="info/[id]"
            options={{
              title: "Details",
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
              title: "Add torrent",
            }}
          />
          <Stack.Protected guard={available && isPro}>
            <Stack.Screen
              name="search"
              options={{ title: "Search" }}
            />
          </Stack.Protected>
          <Stack.Screen
            name="paywall"
            options={{
              presentation: "modal",
              title: "Pro",
            }}
          />
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="settings/servers"
            options={{ title: "Servers" }}
          />
          <Stack.Screen
            name="settings/connection"
            options={{ title: "Server" }}
          />
          <Stack.Screen
            name="settings/configuration"
            options={{ title: "Server Configuration" }}
          />
          <Stack.Screen
            name="settings/security"
            options={{ title: "Authentication" }}
          />
          <Stack.Screen name="settings/theme" options={{ title: "Theme" }} />
          <Stack.Screen name="settings/about" options={{ title: "About" }} />
          <Stack.Screen
            name="settings/pro"
            options={{ title: "Pro" }}
          />
          <Stack.Protected guard={available && isPro}>
            <Stack.Screen
              name="settings/search"
              options={{ title: "Search" }}
            />
            <Stack.Screen
              name="settings/backup"
              options={{ title: "Configuration Backup" }}
            />
          </Stack.Protected>
          <Stack.Screen name="settings/app-id" options={{ title: "App ID" }} />
          <Stack.Screen name="settings/debug" options={{ title: "Debug" }} />
          <Stack.Screen
            name="settings/directories"
            options={{ title: "Download Directories" }}
          />
          <Stack.Screen
            name="settings/directory"
            options={{ title: "Directory" }}
          />
          {__DEV__ && (
            <Stack.Screen
              name="settings/development"
              options={{ title: "Development" }}
            />
          )}
        </Stack>
      </SheetProvider>
    </TorrentSelectionProvider>
  );
}
