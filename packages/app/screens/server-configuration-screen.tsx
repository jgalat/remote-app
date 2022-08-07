import * as React from "react";
import { FlatList } from "react-native";

import useSettings from "../hooks/use-settings";
import { SettingsStackScreenProps } from "../types";

import { Screen, TextInput, Button } from "../components/themed";

export default function ServerConfigurationScreen({
  navigation,
}: SettingsStackScreenProps<"Server">) {
  const { settings, store } = useSettings();
  const { server } = settings;

  const [name, setName] = React.useState(server?.name);
  const [url, setUrl] = React.useState(server?.url);
  const [username, setUsername] = React.useState(server?.username);
  const [password, setPassword] = React.useState(server?.password);

  return (
    <Screen>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Server name"
      />
      <TextInput value={url} onChangeText={setUrl} placeholder="Server RPC URL" />
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
      />
    </Screen>
  );
}
