import * as React from "react";
import { useNavigation } from "@react-navigation/native";

import useSettings from "../hooks/use-settings";
import { Server } from "../store/settings";

import Screen from "../components/screen";
import TextInput from "../components/text-input";
import Button from "../components/button";
import useThemeColor from "../hooks/use-theme-color";

export default function ServerConfigurationScreen() {
  const navigation = useNavigation();
  const { settings, store } = useSettings();
  const { server } = settings;
  const tint = useThemeColor("tint");

  const [name, setName] = React.useState<string>(server?.name ?? "");
  const [url, setUrl] = React.useState<string>(server?.url ?? "");
  const [username, setUsername] = React.useState<string>(
    server?.username ?? ""
  );
  const [password, setPassword] = React.useState<string>(
    server?.password ?? ""
  );

  const save = async () => {
    try {
      if (name === "" || url === "") {
        throw new Error("Name and URL are required");
      }

      const server: Server = {
        name: name,
        url: url,
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
        autoCorrect={false}
        keyboardType={"url"}
        onChangeText={setUrl}
        placeholder="URL (required)"
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
        style={{ backgroundColor: tint }}
        title="Delete"
        disabled={server === undefined}
        onPress={remove}
      />
    </Screen>
  );
}
