import * as React from "react";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import StatusBar from "~/components/status-bar";
import Screen from "~/components/screen";
import useLoader from "~/hooks/use-loader";
import { SettingsProvider } from "~/contexts/settings";
import { AuthProvider } from "~/contexts/auth";

import "~/tasks";
import "~/sheets";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function Root() {
  const loaded = useLoader();

  if (!loaded) {
    return <Screen />;
  }

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: "pop",
          animation: "slide_from_bottom",
          navigationBarHidden: true,
        }}
      />
    </AuthProvider>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SettingsProvider>
          <StatusBar />
          <Root />
        </SettingsProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export { ErrorBoundary } from "expo-router";
