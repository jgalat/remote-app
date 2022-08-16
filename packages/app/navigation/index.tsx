import * as React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from "@react-navigation/native-stack";

import { useColorScheme } from "../hooks/use-settings";
import {
  AddTorrentStackParamList,
  HomeStackParamList,
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

import LinkingConfiguration from "./linking-configuration";
import useThemeColor from "../hooks/use-theme-color";

export default function Navigation() {
  const colorScheme = useColorScheme();
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
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
      <Stack.Screen
        name="Root"
        component={HomeStackNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  const opts = useNavigationOptions();
  return (
    <HomeStack.Navigator initialRouteName="Torrents" screenOptions={opts}>
      <HomeStack.Screen name="Torrents" component={TorrentsScreen} />

      <HomeStack.Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{ headerShown: false }}
      />

      <HomeStack.Screen
        name="AddTorrentStack"
        component={AddTorrentStackNavigator}
        options={{ headerShown: false }}
      />

      <HomeStack.Screen
        name="TorrentDetails"
        component={NotFoundScreen}
        options={{}}
      />
    </HomeStack.Navigator>
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
