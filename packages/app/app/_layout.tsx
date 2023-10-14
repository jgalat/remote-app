import * as React from "react";
import { SplashScreen, Stack } from "expo-router";
import { SheetProvider } from "react-native-actions-sheet";
import * as Notifications from "expo-notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@react-navigation/native";

import StatusBar from "../components/status-bar";
import useLoader from "../hooks/use-loader";
import { SettingsProvider } from "../contexts/settings";
import { ClientProvider } from "../contexts/transmission-client";
import { TorrentSelectionProvider } from "../contexts/torrent-selection";
import { useTheme } from "../hooks/use-theme-color";
import ActionIcon from "../components/action-icon";
import { useColorScheme } from "../hooks/use-settings";
import { DarkTheme, DefaultTheme } from "../constants/theme";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient();

function App() {
  const colorScheme = useColorScheme();
  const loaded = useLoader();
  const { text, background } = useTheme();

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={({ navigation }) => ({
          headerTitleStyle: {
            fontFamily: "RobotoMono-Medium",
            color: text,
          },
          headerStyle: {
            backgroundColor: background,
          },
          headerShadowVisible: false,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <ActionIcon
                name="arrow-left"
                onPress={() => navigation.goBack()}
                style={{ paddingLeft: 0, paddingRight: 32 }}
              />
            ) : null,
        })}
      />
      <StatusBar />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ClientProvider>
          <TorrentSelectionProvider>
            <SheetProvider>
              <App />
            </SheetProvider>
          </TorrentSelectionProvider>
        </ClientProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
