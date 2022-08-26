import * as React from "react";
import * as Linking from "expo-linking";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigationContainerRef,
  LinkingOptions,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useColorScheme, useServer } from "../hooks/use-settings";
import useThemeColor from "../hooks/use-theme-color";
import { RootStackParamList, SettingsStackParamList } from "../types";

import NotFoundScreen from "../screens/not-found-screen";
import TorrentsScreen from "../screens/torrents-screen";
import SettingsScreen from "../screens/settings-screen";
import AddTorrentMagnetScreen from "../screens/add-torrent-magnet-screen";
import ThemeScreen from "../screens/theme-screen";
import ConnectionSetupScreen from "../screens/connection-setup-screen";

export default function Navigation({
  onReady,
}: Pick<React.ComponentProps<typeof NavigationContainer>, "onReady">) {
  const colorScheme = useColorScheme();
  const { onReady: listener, ref, ...props } = useNavigationContainerProps();

  return (
    <NavigationContainer
      ref={ref}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      onReady={() => {
        onReady?.();
        listener();
      }}
      {...props}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const opts = useNavigationOptions();
  const server = useServer();
  return (
    <Stack.Navigator initialRouteName="Root" screenOptions={opts}>
      <Stack.Screen name="Root" component={TorrentsScreen} />

      <Stack.Group
        screenOptions={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      >
        {!!server ? (
          <>
            <Stack.Screen
              name="TorrentDetails"
              component={NotFoundScreen}
              options={{}}
            />

            <Stack.Screen
              name="AddTorrentFile"
              component={NotFoundScreen}
              options={{
                title: "Import torrent file",
              }}
            />

            <Stack.Screen
              name="AddTorrentMagnet"
              component={AddTorrentMagnetScreen}
              options={{
                title: "Import magnet URL",
              }}
            />
          </>
        ) : null}

        <Stack.Screen
          name="SettingsStack"
          component={SettingsStackNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Group>

      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function SettingsStackNavigator() {
  const opts = useNavigationOptions();
  return (
    <SettingsStack.Navigator initialRouteName="Settings" screenOptions={opts}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />

      <SettingsStack.Group screenOptions={{ animation: "slide_from_right" }}>
        <SettingsStack.Screen
          name="ConnectionSetup"
          component={ConnectionSetupScreen}
          options={{
            title: "Connection",
          }}
        />

        <SettingsStack.Screen
          name="Theme"
          component={ThemeScreen}
          options={{
            title: "Select theme",
          }}
        />
      </SettingsStack.Group>
    </SettingsStack.Navigator>
  );
}

function useNavigationOptions(): NativeStackNavigationOptions {
  const text = useThemeColor("text");
  const background = useThemeColor("background");
  return {
    headerTitleStyle: {
      fontFamily: "roboto-mono_medium",
      color: text,
    },
    headerStyle: {
      backgroundColor: background,
    },
    headerShadowVisible: false,
  };
}

function useNavigationContainerProps() {
  const ref = useNavigationContainerRef();
  const server = useServer();

  const onReady = React.useCallback(async () => {
    if (!!server) {
      return;
    }

    const url = await Linking.getInitialURL();
    if (url?.startsWith("magnet:")) {
      ref.navigate("AddTorrentMagnet", { url });
    }
  }, [ref, server]);

  const subscribe = React.useCallback(
    (listener: (url: string) => void) => {
      if (!!server) {
        return;
      }

      const subscription = Linking.addEventListener("url", ({ url }) => {
        if (url?.startsWith("magnet:")) {
          ref.navigate("AddTorrentMagnet", { url });
        }
        listener(url);
      });
      return () => subscription.remove();
    },
    [ref, server]
  );

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        Root: "/",
        TorrentDetails: {
          path: "/torrents/:id",
        },
        AddTorrentFile: {
          path: "/add-file",
        },
        AddTorrentMagnet: {
          path: "/add-magnet",
        },
        SettingsStack: {
          path: "/settings",
          initialRouteName: "Settings",
          screens: {
            Settings: {
              path: "/",
            },
            ConnectionSetup: {
              path: "/connection",
            },
            Theme: {
              path: "/theme",
            },
          },
        },
        NotFound: "*",
      },
    },
    subscribe,
  };

  return { ref, onReady, linking };
}
