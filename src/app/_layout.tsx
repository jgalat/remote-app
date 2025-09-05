import * as React from "react";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import "react-native-reanimated";

import useLoader from "~/hooks/use-loader";
import { useColorScheme } from "~/hooks/use-settings";
import { SettingsProvider } from "~/contexts/settings";
import { AuthProvider } from "~/contexts/auth";
import useAuth from "~/hooks/use-auth";

import "~/tasks";
import "~/sheets";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function Root() {
  const colorScheme = useColorScheme();
  const loaded = useLoader();
  const { locked } = useAuth();

  const onRootLayout = React.useCallback(() => {
    if (loaded) {
      SplashScreen.hide();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "transparent" }}
        edges={["right", "bottom", "left"]}
      >
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={{ flex: 1 }} onLayout={onRootLayout}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Protected guard={!locked}>
              <Stack.Screen
                name="(app)"
                options={{
                  animationTypeForReplace: "pop",
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={locked}>
              <Stack.Screen name="sign-in" />
            </Stack.Protected>
          </Stack>
        </View>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failures, error) => {
        if (error instanceof Error && error.message.includes("401")) {
          return false;
        }
        return failures < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardProvider>
        <SettingsProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </SettingsProvider>
      </KeyboardProvider>
    </QueryClientProvider>
  );
}

export { ErrorBoundary } from "expo-router";
