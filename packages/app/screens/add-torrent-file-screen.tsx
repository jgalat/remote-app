import * as React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import Text from "../components/text";
import View from "../components/view";
import Button from "../components/button";
import KeyValue from "../components/key-value";
import { useTheme } from "../hooks/use-theme-color";
import { RootStackParamList } from "../types";
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { formatSize } from "../utils/formatters";

export default function AddTorrentFileScreen() {
  const {
    params: { uri },
  } =
    useRoute<
      NativeStackScreenProps<RootStackParamList, "AddTorrentFile">["route"]
    >();

  const { red } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const add = useAddTorrent();
  const { data: freeSpace, error } = useFreeSpace();
  const [state, setState] = React.useState<{
    error?: string;
    uri?: string;
    filename?: string;
    sending?: boolean;
  }>({ sending: false });

  React.useEffect(() => {
    async function updateUri() {
      if (uri) {
        const filename = `[Filename unavailable].torrent`;
        const fileUri = `${FileSystem.cacheDirectory}${Date.now()}.torrent`;
        try {
          await FileSystem.copyAsync({ from: uri, to: fileUri });
          setState({ ...state, error: undefined, uri: fileUri, filename });
        } catch (e: any) {
          setState({ ...state, error: e.message });
        }
      }
    }

    updateUri();
  }, [uri]);

  const onPick = React.useCallback(async () => {
    const file = await DocumentPicker.getDocumentAsync({
      type: "application/x-bittorrent",
    });

    if (file.type === "cancel") {
      return;
    }

    setState({
      ...state,
      error: undefined,
      uri: file.uri,
      filename: file.name,
    });
  }, [setState]);

  const onAdd = React.useCallback(async () => {
    if (!state.uri) {
      return;
    }

    setState({ ...state, sending: true });
    const content = await FileSystem.readAsStringAsync(state.uri, {
      encoding: "base64",
    });

    try {
      await add.file(content);
      navigation.popToTop();
    } catch (e: any) {
      setState({ ...state, sending: false, error: e.message });
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={styles.file}>
        <KeyValue field="Filename" value={state.filename ?? "..."} />
      </View>
      <Button title="Choose a file" onPress={onPick} />
      <Button
        disabled={!state.uri || error}
        title={state.sending ? "Sending..." : "Add Torrent"}
        onPress={onAdd}
      />
      {state.error || error ? (
        <Text color={red} style={styles.error}>
          {state.error ?? error.message}
        </Text>
      ) : null}
      <Text style={styles.free} numberOfLines={1}>
        Free space:{" "}
        {freeSpace?.["size-bytes"]
          ? formatSize(freeSpace?.["size-bytes"])
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
