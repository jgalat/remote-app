import * as React from "react";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import { useTheme } from "~/hooks/use-theme-color";
import useSettings from "~/hooks/use-settings";
import type { Server } from "~/store/settings";

type Form = {
  name: string;
  url: string;
  username: string;
  password: string;
};

export default function ConnectionScreen() {
  const { settings, store } = useSettings();
  const { server } = settings;
  const { red } = useTheme();

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

      store({ server });
      router.dismiss();
    } catch (e) {
      let message = "Something went wrong";
      if (e instanceof Error) {
        message = e.message;
      }
      setError(message);
    }
  }, [form, store]);

  const remove = React.useCallback(async () => {
    store({ server: undefined });
    router.dismiss();
  }, [store]);

  return (
    <Screen variant="keyboardavoiding">
      <View style={styles.row}>
        <Text style={styles.label}>Server name (required)</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => updateForm({ name: t })}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>RPC URL (required)</Text>
        <TextInput
          style={styles.input}
          value={form.url}
          autoCorrect={false}
          keyboardType={"url"}
          onChangeText={(t) => updateForm({ url: t })}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Username (optional)</Text>
        <TextInput
          style={styles.input}
          value={form.username}
          onChangeText={(t) => updateForm({ username: t })}
        />
      </View>
      <View style={[styles.row, { marginBottom: 32 }]}>
        <Text style={styles.label}>Password (optional)</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={(t) => updateForm({ password: t })}
        />
      </View>
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
  row: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 12,
  },
  input: {},
  error: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 16,
  },
});
