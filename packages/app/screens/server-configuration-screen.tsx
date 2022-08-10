import * as React from "react";
import { useNavigation } from "@react-navigation/native";

import useSettings, { useColorScheme } from "../hooks/use-settings";
import { Server } from "../store/settings";
import Colors from "../constants/colors";

import { Screen, TextInput, Button } from "../components/themed";

export default function ServerConfigurationScreen() {
  const navigation = useNavigation();
  const { settings, store } = useSettings();
  const { server } = settings;
  const colorScheme = useColorScheme();

  const [name, setName] = React.useState(server?.name);
  const [url, setUrl] = React.useState(server?.url);
  const [username, setUsername] = React.useState(server?.username);
  const [password, setPassword] = React.useState(server?.password);

  const save = async () => {
    try {
      new URL(url ?? "");

      const server: Server = {
        name: name ?? "",
        url: url ?? "",
        username: username === "" ? undefined : username,
        password: password === "" ? undefined : password,
      };
      await store({ ...settings, server });
      navigation.goBack();
    } catch (e) {
      console.warn(e);
    }
  };

  const remove = async () => {
    await store({ ...settings, server: undefined });
    navigation.goBack();
  };

  return (
    <Screen>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Server name (required)"
      />
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="Host (required)"
      />
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username (optional)"
      />
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password (optional)"
      />
      <Button
        title="Save"
        disabled={name === "" || url === ""}
        onPress={save}
      />
      <Button
        style={{ backgroundColor: Colors[colorScheme].primary }}
        title="Delete"
        onPress={remove}
      />
    </Screen>
  );
}
