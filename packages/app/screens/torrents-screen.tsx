import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useServer } from "../hooks/use-settings";
import Text from "../components/text";
import Screen from "../components/screen";
import Button from "../components/button";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import { HomeStackParamList } from "../types";
import useThemeColor from "../hooks/use-theme-color";

export default function TorrentsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const server = useServer();
  const text = useThemeColor("text");

  React.useLayoutEffect(() => {
    if (!server || server.name === "") {
      navigation.setOptions({ title: "Torrents" });
      return;
    }
    navigation.setOptions({ title: server.name });
  }, [server, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ActionList>
          <ActionIcon
            onPress={() => navigation.navigate("AddTorrent")}
            name="plus"
            size={24}
            color={text}
          />
          <ActionIcon
            onPress={() => navigation.navigate("SettingsRoot")}
            name="settings"
            size={24}
            color={text}
          />
        </ActionList>
      ),
    });
  }, [navigation, text]);

  if (!server) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>No server found :(</Text>
        <Button
          title="Configure server"
          onPress={() =>
            navigation.navigate("SettingsRoot", { screen: "Server" })
          }
        />
      </Screen>
    );
  }
  return <Screen scroll></Screen>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 24,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
