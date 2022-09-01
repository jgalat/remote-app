import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import useSettings from "../hooks/use-settings";
import { Server } from "../store/settings";

import Screen from "../components/screen";
import TextInput from "../components/text-input";
import Button from "../components/button";
import useThemeColor from "../hooks/use-theme-color";
import { RootStackParamList } from "../types";

export default function ConnectionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, store } = useSettings();
  const { server } = settings;
  const red = useThemeColor("red");

  const [form, setForm] = React.useState<{
    name: string;
    url: string;
    username: string;
    password: string;
  }>({
    name: server?.name ?? "",
    url: server?.url ?? "",
    username: server?.username ?? "",
    password: server?.password ?? "",
  });

  const save = async () => {
    try {
      if (form.name === "" || form.url === "") {
        throw new Error("Name and URL are required");
      }

      const server: Server = {
        ...form,
        username: form.username === "" ? undefined : form.username,
        password: form.password === "" ? undefined : form.password,
      };
      await store({ ...settings, server });
      navigation.popToTop();
    } catch (e) {
      console.warn(e);
    }
  };

  const remove = async () => {
    await store({ ...settings, server: undefined });
    navigation.popToTop();
  };

  return (
    <Screen>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
        placeholder="Server name (required)"
      />
      <TextInput
        style={styles.input}
        value={form.url}
        autoCorrect={false}
        keyboardType={"url"}
        onChangeText={(t) => setForm({ ...form, url: t })}
        placeholder="RPC URL (required)"
      />
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={(t) => setForm({ ...form, username: t })}
        placeholder="Username (optional)"
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(t) => setForm({ ...form, password: t })}
        placeholder="Password (optional)"
      />
      <Button
        title="Save"
        disabled={form.name === "" || form.url === ""}
        onPress={save}
      />
      {server ? (
        <Button
          style={{ backgroundColor: red }}
          title="Delete"
          onPress={remove}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 24,
  }
})
