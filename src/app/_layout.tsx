import * as React from "react";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import View from "~/components/view";
import useLoader from "~/hooks/use-loader";
import { useColorScheme } from "~/hooks/use-settings";
import { ProProvider } from "@remote-app/pro";
import { AuthProvider } from "~/contexts/auth";
import useAuth from "~/hooks/use-auth";

import "~/i18n";
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
      setTimeout(() => SplashScreen.hide(), 500);
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
      staleTime: 5 * 60 * 1_000,
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <ProProvider>
            <AuthProvider>
              <Root />
            </AuthProvider>
          </ProProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export { ErrorBoundary } from "expo-router";
