import * as React from "react";
import type {
  ParamListBase,
  TabNavigationState,
} from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import type {
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import {
  useGlobalSearchParams,
  useNavigation,
  withLayoutContext,
} from "expo-router";
import { useTheme } from "~/hooks/use-theme-color";
import { useTorrentActionsSheet } from "~/hooks/use-action-sheet";
import ActionList from "~/components/action-list";
import ActionIcon from "~/components/action-icon";
import { useTorrent } from "~/hooks/transmission";

const { Navigator } = createMaterialTopTabNavigator();

const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const tabBarItemStyle = {
  minHeight: 16,
  maxHeight: 32,
  width: 96,
};

export default function Layout() {
  const navigation = useNavigation();
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { tint, text, background } = useTheme();
  const torrentActionsSheet = useTorrentActionsSheet();
  const { data: torrents, error } = useTorrent(+id);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        error || !torrents ? null : (
          <ActionList>
            <ActionIcon
              onPress={() => torrentActionsSheet({ torrents, info: true })}
              name="more-vertical"
            />
          </ActionList>
        ),
    });
  }, [torrentActionsSheet, navigation, error, torrents]);

  const screenOptions = React.useMemo(
    () => ({
      tabBarLabelStyle: {
        fontFamily: "RobotoMono-Medium" as const,
        color: text,
        fontSize: 14,
        margin: 0,
        padding: 0,
        height: 24,
      },
      tabBarStyle: {
        backgroundColor: background,
        height: 32,
        justifyContent: "center" as const,
        elevation: 0,
      },
      tabBarItemStyle: tabBarItemStyle,
      tabBarScrollEnabled: true,
      tabBarIndicatorStyle: { backgroundColor: tint, height: 2 },
    }),
    [text, background, tint]
  );

  return (
    <MaterialTopTabs screenOptions={screenOptions}>
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: "Info",
        }}
      />
      <MaterialTopTabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
      <MaterialTopTabs.Screen
        name="files"
        options={{
          title: "Files",
        }}
      />
      <MaterialTopTabs.Screen
        name="trackers"
        options={{
          title: "Trackers",
        }}
      />
      <MaterialTopTabs.Screen
        name="peers"
        options={{
          title: "Peers",
        }}
      />
      <MaterialTopTabs.Screen
        name="pieces"
        options={{
          title: "Pieces",
        }}
      />
    </MaterialTopTabs>
  );
}
