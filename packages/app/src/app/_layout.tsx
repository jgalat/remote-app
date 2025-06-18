import * as React from "react";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
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

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1_000,
  fade: true,
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function Root() {
  const colorScheme = useColorScheme();
  const loaded = useLoader();

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
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
