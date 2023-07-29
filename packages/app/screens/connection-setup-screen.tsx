import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Text from "../components/text";
import Screen from "../components/screen";
import TextInput from "../components/text-input";
import Button from "../components/button";
import useThemeColor from "../hooks/use-theme-color";
import useSettings from "../hooks/use-settings";
import type { RootStackParamList } from "../types";
import type { Server } from "../store/settings";

type Form = {
  name: string;
  url: string;
  username: string;
  password: string;
};

export default function ConnectionScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { settings, store } = useSettings();
  const { server } = settings;
  const red = useThemeColor("red");

  const [form, updateForm] = React.useReducer(
    (prev: Form, f: Partial<Form>) => ({ ...prev, ...f }),
    {
      name: server?.name ?? "",
      url: server?.url ?? "",
      username: server?.username ?? "",
      password: server?.password ?? "",
    }
  );
  const [error, setError] = React.useState<string>();

  const save = React.useCallback(async () => {
    try {
      if (form.name === "" || form.url === "") {
        throw new Error("Name and URL are required");
      }

      const server: Server = {
        ...form,
        username: form.username === "" ? undefined : form.username,
        password: form.password === "" ? undefined : form.password,
      };
      await store({ server });
      navigation.popToTop();
    } catch (e) {
      let message = "Something went wrong";
      if (e instanceof Error) {
        message = e.message;
      }
      setError(message);
    }
  }, [form, navigation, store]);

  const remove = React.useCallback(async () => {
    await store({ server: undefined });
    navigation.popToTop();
  }, [store, navigation]);

  return (
    <Screen variant="scroll">
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => updateForm({ name: t })}
        placeholder="Server name (required)"
      />
      <TextInput
        style={styles.input}
        value={form.url}
        autoCorrect={false}
        keyboardType={"url"}
        onChangeText={(t) => updateForm({ url: t })}
        placeholder="RPC URL (required)"
      />
      <TextInput
        style={styles.input}
        value={form.username}
        onChangeText={(t) => updateForm({ username: t })}
        placeholder="Username (optional)"
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(t) => updateForm({ password: t })}
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
      {error ? (
        <Text color={red} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 24,
  },
  error: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 16,
  },
});
