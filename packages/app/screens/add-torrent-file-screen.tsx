import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import Text from "../components/text";
import View from "../components/view";
import Button from "../components/button";
import KeyValue from "../components/key-value";
import { useTheme } from "../hooks/use-theme-color";
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { formatSize } from "../utils/formatters";
import type { RootStackParamList } from "../types";

type State = {
  uri?: string;
  filename?: string;
  error?: string;
};

export default function AddTorrentFileScreen() {
  const { red } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const addTorrent = useAddTorrent();
  const freeSpace = useFreeSpace();
  const [state, setState] = React.useReducer(
    (prev: State, s: Partial<State>) => ({ ...prev, ...s }),
    {}
  );

  const onPick = React.useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/x-bittorrent",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const [file] = result.assets;

    setState({
      error: undefined,
      uri: file.uri,
      filename: file.name,
    });
  }, []);

  const onAdd = React.useCallback(async () => {
    if (!state.uri) {
      return;
    }

    try {
      const content = await FileSystem.readAsStringAsync(state.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await addTorrent.mutateAsync({ metainfo: content });
      navigation.popToTop();
    } catch (e) {
      let message = "Something went wrong";
      if (e instanceof Error) {
        message = e.message;
      }
      setState({ error: message });
    }
  }, [navigation, state.uri, addTorrent]);

  return (
    <View style={styles.container}>
      <View style={styles.file}>
        <KeyValue field="Filename" value={state.filename ?? "..."} />
      </View>
      <Button title="Choose a file" onPress={onPick} />
      <Button
        disabled={!state.uri || freeSpace.isError}
        title={addTorrent.isLoading ? "Sending..." : "Add Torrent"}
        onPress={onAdd}
      />
      {state.error || freeSpace.isError ? (
        <Text color={red} style={styles.error}>
          {state.error ?? freeSpace.error?.message}
        </Text>
      ) : null}
      <Text style={styles.free} numberOfLines={1}>
        Free space:{" "}
        {freeSpace.data?.["size-bytes"]
          ? formatSize(freeSpace.data?.["size-bytes"])
          : "loading..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
    justifyContent: "center",
    padding: 20,
  },
  file: {
    marginBottom: 40,
  },
  error: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 16,
  },
  free: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 16,
  },
});
