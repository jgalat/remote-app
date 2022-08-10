import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useServer, useColorScheme } from "../hooks/use-settings";
import { Text, Screen, Button } from "../components/themed";
import ActionList from "../components/action-list";
import ActionIcon from "../components/action-icon";
import Colors from "../constants/colors";
import { HomeStackParamList } from "../types";

export default function TorrentsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const server = useServer();
  const colorScheme = useColorScheme();

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
    });
  }, [navigation]);

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
