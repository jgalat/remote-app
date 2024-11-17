import * as React from "react";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import useLoader from "~/hooks/use-loader";
import { SettingsProvider } from "~/contexts/settings";
import { AuthProvider } from "~/contexts/auth";

import "~/tasks";
import "~/sheets";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// StatusBar.setStatusBarStyle(colorScheme === "dark" ? "light" : "dark");
// await SystemUI.setBackgroundColorAsync(colors[colorScheme].background);

function Root() {
  const loaded = useLoader();

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack
        initialRouteName="(app)"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen
          name="(app)"
          options={{
            animationTypeForReplace: "pop",
          }}
        />
        <Stack.Screen name="sign-in" />
      </Stack>
    </AuthProvider>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SettingsProvider>
            <Root />
          </SettingsProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export { ErrorBoundary } from "expo-router";
