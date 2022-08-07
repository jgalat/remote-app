import * as React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Colors from "../constants/colors";
import { useColorScheme } from "../hooks/use-settings";
import {
  HomeStackParamList,
  RootStackParamList,
  HomeStackScreenProps,
  SettingsStackParamList,
  SettingsStackScreenProps,
} from "../types";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";

import ModalScreen from "../screens/modal-screen";
import NotFoundScreen from "../screens/not-found-screen";
import TorrentsScreen from "../screens/torrents-screen";
import SettingsScreen from "../screens/settings-screen";
import ThemeScreen from "../screens/theme-screen";

import LinkingConfiguration from "./linking-configuration";
import { ColorScheme } from "../store/settings";

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
  // <Stack.Group screenOptions={{ presentation: "modal" }}>
  //   <Stack.Screen name="Modal" component={ModalScreen} />
  // </Stack.Group>
  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true,
        headerTitleStyle: {
          fontWeight: "500",
          fontFamily: "roboto-mono",
        },
      }}
    >
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
  const colorScheme = useColorScheme();
  return (
    <HomeStack.Navigator
      initialRouteName="Torrents"
      screenOptions={{
        headerTitleStyle: {
          fontFamily: "roboto-mono",
          fontWeight: "500",
          color: Colors[colorScheme].text,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen
        name="Torrents"
        component={TorrentsScreen}
        options={({ navigation }: HomeStackScreenProps<"Torrents">) => ({
          title: "Torrents",
          headerRight: () => (
            <ActionList>
              <ActionIcon
                onPress={() => navigation.navigate("AddTorrent")}
                name="plus"
                size={24}
                color={Colors[colorScheme].text}
              />
              <ActionIcon
                onPress={() => navigation.navigate("SettingsRoot")}
                name="settings"
                size={24}
                color={Colors[colorScheme].text}
              />
            </ActionList>
          ),
        })}
      />

      <HomeStack.Group screenOptions={{ presentation: "modal" }}>
        <HomeStack.Screen
          name="SettingsRoot"
          component={SettingsStackNavigator}
          options={{ headerShown: false }}
        />

        <HomeStack.Screen
          name="AddTorrent"
          component={NotFoundScreen}
          options={{}}
        />

        <HomeStack.Screen
          name="TorrentDetails"
          component={NotFoundScreen}
          options={{}}
        />
      </HomeStack.Group>
    </HomeStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function SettingsStackNavigator() {
  const colorScheme = useColorScheme();
  return (
    <SettingsStack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        headerTitleStyle: {
          fontFamily: "roboto-mono",
          fontWeight: "500",
          color: Colors[colorScheme].text,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerShadowVisible: false,
      }}
    >
      <SettingsStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{}}
      />

      <SettingsStack.Group screenOptions={{ presentation: "modal" }}>
        <SettingsStack.Screen
          name="Server"
          component={NotFoundScreen}
          options={{
            title: "Configure server",
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
