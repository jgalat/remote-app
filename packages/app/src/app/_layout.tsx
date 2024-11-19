import * as React from "react";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import useLoader from "~/hooks/use-loader";
import { useColorScheme } from "~/hooks/use-settings";
import { SettingsProvider } from "~/contexts/settings";
import { AuthProvider } from "~/contexts/auth";

import "~/tasks";
import "~/sheets";
import { LoadingScreen } from "~/components/utility-screens";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function Root() {
  const colorScheme = useColorScheme();
  const loaded = useLoader();

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {loaded ? (
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
      ) : (
        <LoadingScreen />
      )}
    </>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SettingsProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </SettingsProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export { ErrorBoundary } from "expo-router";
