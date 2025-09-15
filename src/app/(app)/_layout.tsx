import * as React from "react";
import { Stack, useRouter } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";

import { TorrentSelectionProvider } from "~/contexts/torrent-selection";
import useScreenOptions from "~/hooks/use-screen-options";
import ActionIcon from "~/components/action-icon";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function AppLayout() {
  const opts = useScreenOptions();
  const router = useRouter();

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
          <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
          <Stack.Screen
            name="settings/connection"
            options={{ title: "Connection" }}
          />
          <Stack.Screen
            name="settings/configuration"
            options={{ title: "Server Configuration" }}
          />
          <Stack.Screen
            name="settings/security"
            options={{ title: "Security" }}
          />
          <Stack.Screen name="settings/theme" options={{ title: "Theme" }} />
          <Stack.Screen name="settings/about" options={{ title: "About" }} />
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
