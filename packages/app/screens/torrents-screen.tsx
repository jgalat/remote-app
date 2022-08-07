import * as React from "react";
import { StyleSheet } from "react-native";

import { useServer } from "../hooks/use-settings";
import { Text,  Screen, Button } from "../components/themed";
import { HomeStackScreenProps } from "../types";

export default function TorrentsScreen({
  navigation,
}: HomeStackScreenProps<"Torrents">) {
  const server = useServer();

  React.useEffect(() => {
    if (!server || server.name === "") {
      navigation.setOptions({ title: "Torrents" });
      return;
    }
    navigation.setOptions({ title: server.name });
  }, [server]);

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
  return (
    <Screen scroll>
    </Screen>
  );
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
