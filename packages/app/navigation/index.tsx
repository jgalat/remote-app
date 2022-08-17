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

import { useColorScheme } from "../hooks/use-settings";
import {
  AddTorrentStackParamList,
  RootStackParamList,
  SettingsStackParamList,
} from "../types";

import NotFoundScreen from "../screens/not-found-screen";
import TorrentsScreen from "../screens/torrents-screen";
import SettingsScreen from "../screens/settings-screen";
import AddTorrentScreen from "../screens/add-torrent-screen";
import AddTorrentMagnetScreen from "../screens/add-torrent-magnet-screen";
import ThemeScreen from "../screens/theme-screen";
import ConnectionSetupScreen from "../screens/connection-setup-screen";

import useThemeColor from "../hooks/use-theme-color";

export default function Navigation() {
  const colorScheme = useColorScheme();
  const props = useNavigationContainerProps();
  return (
    <NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const opts = useNavigationOptions();
  return (
    <Stack.Navigator initialRouteName="Root" screenOptions={opts}>
      <Stack.Screen name="Root" component={TorrentsScreen} />

      <Stack.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AddTorrentStack"
        component={AddTorrentStackNavigator}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="TorrentDetails"
        component={NotFoundScreen}
        options={{}}
      />

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

const AddTorrentStack = createNativeStackNavigator<AddTorrentStackParamList>();

function AddTorrentStackNavigator() {
  const opts = useNavigationOptions();
  return (
    <AddTorrentStack.Navigator
      initialRouteName="AddTorrent"
      screenOptions={opts}
    >
      <AddTorrentStack.Screen
        name="AddTorrent"
        component={AddTorrentScreen}
        options={{ title: "Add Torrent" }}
      />

      <AddTorrentStack.Group screenOptions={{ animation: "slide_from_right" }}>
        <AddTorrentStack.Screen
          name="File"
          component={NotFoundScreen}
          options={{
            title: "File",
          }}
        />

        <AddTorrentStack.Screen
          name="Magnet"
          component={AddTorrentMagnetScreen}
          options={{
            title: "Magnet URL",
          }}
        />
      </AddTorrentStack.Group>
    </AddTorrentStack.Navigator>
  );
}

function useNavigationOptions(): NativeStackNavigationOptions {
  const text = useThemeColor("text");
  const background = useThemeColor("background");
  return {
    headerTitleStyle: {
      fontFamily: "roboto-mono",
      fontWeight: "500",
      color: text,
    },
    headerStyle: {
      backgroundColor: background,
    },
    headerShadowVisible: false,
  };
}

function useNavigationContainerProps() {
  const ref = useNavigationContainerRef<RootStackParamList>();

  const getInitialURL = React.useCallback(async () => {
    const url = await Linking.getInitialURL();
    if (url?.startsWith("magnet:")) {
      ref.navigate("AddTorrentStack", { screen: "Magnet", params: { url } });
    }

    return url;
  }, [ref]);

  const subscribe = React.useCallback(
    (listener: (url: string) => void) => {
      const subscription = Linking.addEventListener("url", ({ url }) => {
        if (url?.startsWith("magnet:")) {
          ref.navigate("AddTorrentStack", {
            screen: "Magnet",
            params: { url },
          });
        }
        listener(url);
      });
      return () => subscription.remove();
    },
    [ref]
  );

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        Root: "/",
        TorrentDetails: {
          path: "/torrents/:id",
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
        AddTorrentStack: {
          path: "/add",
          initialRouteName: "AddTorrent",
          screens: {
            AddTorrent: {
              path: "/",
            },
            File: {
              path: "/file",
            },
            Magnet: {
              path: "/magnet",
            },
          },
        },
        NotFound: "*",
      },
    },
    getInitialURL,
    subscribe,
  };

  return { ref, linking };
}
