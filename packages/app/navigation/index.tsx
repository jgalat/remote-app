import * as React from "react";
import * as Linking from "expo-linking";
import {
  NavigationContainer as _NavigationContainer,
  DefaultTheme,
  DarkTheme,
  useNavigationContainerRef,
  LinkingOptions,
  NavigationContainerProps,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import ActionIcon from "../components/action-icon";
import { useColorScheme, useServer } from "../hooks/use-settings";
import { useTheme } from "../hooks/use-theme-color";
import { RootStackParamList, SettingsStackParamList } from "../types";

import NotFoundScreen from "../screens/not-found";
import TorrentsScreen from "../screens/torrents";
import SettingsScreen from "../screens/settings";
import AboutScreen from "../screens/about";
import AddTorrentMagnetScreen from "../screens/add-torrent-magnet";
import AddTorrentFileScreen from "../screens/add-torrent-file";
import ConnectionSetupScreen from "../screens/connection-setup";
import ServerConfigurationScreen from "../screens/server-configuration";
import SecurityScreen from "../screens/security";
import ThemeScreen from "../screens/theme";
import TorrentDetailsScreen from "../screens/torrent-details";

export function NavigationContainer({
  children,
  onReady: onLoad,
  ...override
}: NavigationContainerProps & { onReady: () => void }) {
  const colorScheme = useColorScheme();
  const { onReady: linkRedirect, ...props } = useNavigationContainerProps();

  const onReady = React.useCallback(async () => {
    await linkRedirect();
    onLoad();
  }, [linkRedirect, onLoad]);

  return (
    <_NavigationContainer
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      {...props}
      {...override}
      onReady={onReady}
    >
      {children}
    </_NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
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
        {server ? (
          <>
            <Stack.Screen
              name="TorrentDetails"
              component={TorrentDetailsScreen}
              options={{ title: "Details" }}
            />

            <Stack.Screen
              name="AddTorrentFile"
              component={AddTorrentFileScreen}
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
          name="ServerConfiguration"
          component={ServerConfigurationScreen}
          options={{
            title: "Server configuration",
          }}
        />
        <SettingsStack.Screen
          name="Security"
          component={SecurityScreen}
          options={{
            title: "Security",
          }}
        />
        <SettingsStack.Screen
          name="Theme"
          component={ThemeScreen}
          options={{
            title: "Select theme",
          }}
        />
        <SettingsStack.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: "About",
          }}
        />
      </SettingsStack.Group>
    </SettingsStack.Navigator>
  );
}

function useNavigationOptions(): (props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
}) => NativeStackNavigationOptions {
  const { text, background } = useTheme();
  return ({ navigation }) => ({
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
  });
}

function useNavigationContainerProps() {
  const ref = useNavigationContainerRef();
  const server = useServer();

  const onReady = React.useCallback(async () => {
    if (!server) {
      return;
    }

    const url = await Linking.getInitialURL();
    if (url?.startsWith("magnet:")) {
      ref.navigate("AddTorrentMagnet", { uri: url });
    }
  }, [ref, server]);

  const subscribe = React.useCallback(
    (listener: (url: string) => void) => {
      if (!server) {
        return;
      }

      const subscription = Linking.addEventListener("url", ({ url }) => {
        if (url.startsWith("magnet:")) {
          ref.navigate("AddTorrentMagnet", { uri: url });
        }
        listener(url);
      });
      return () => subscription.remove();
    },
    [ref, server]
  );

  const getInitialURL = React.useCallback(() => {
    return Linking.createURL("/");
  }, []);

  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL("/")],
    config: {
      screens: {
        Root: {
          path: "/",
        },
        TorrentDetails: {
          path: "/torrents/:id",
          parse: {
            id: (s: string) => Number(s),
          },
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
            ServerConfiguration: {
              path: "/server-configuration",
            },
            Theme: {
              path: "/theme",
            },
            Security: {
              path: "/security",
            },
            About: {
              path: "/about",
            },
          },
        },
        NotFound: "*",
      },
    },
    getInitialURL,
    subscribe,
  };

  return { ref, onReady, linking };
}
