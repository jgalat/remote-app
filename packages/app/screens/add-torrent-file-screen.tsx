import * as React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Instance, decode } from "magnet-uri";

import Text from "../components/text";
import View from "../components/view";
import Button from "../components/button";
import KeyValue from "../components/key-value";
import { useTheme } from "../hooks/use-theme-color";
import { RootStackParamList } from "../types";
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { formatSize } from "../utils/formatters";

const isString = (v: string | string[]): v is string => {
  return typeof v === "string";
};

export default function AddTorrentFileScreen() {
  const {
    params: { url },
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
    if (url && url !== state.uri) {
      FileSystem.read
      setState({
        url,
        error: undefined,
        // data: decode(url),
      });
    }
  }, [url]);

  const onPick = React.useCallback(async () => {
    // const text = await Clipboard.getStringAsync();
    // if (text.startsWith("magnet:")) {
    //   setState({ url: text, error: undefined, data: decode(text as string) });
    // } else {
    //   setState({ error: "Invalid Magnet URL" });
    // }
    const file = await DocumentPicker.getDocumentAsync({
      type: "application/x-bittorrent",
    });

    if (file.type === "cancel") {
      return;
    }

    setState({ ...state, error: undefined, uri: file.uri, filename: file.name });
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
    } catch (e) {
      setState({ ...state, sending: false, error: e.message });
    }
  }, [state]);

  // const magnet = React.useMemo(() => {
  //   const { dn, xt, tr } = state.data ?? {};

  //   return [
  //     {
  //       field: "Name",
  //       value: dn ? (isString(dn) ? dn : dn.join(", ")) : "...",
  //     },
  //     {
  //       field: "Hash",
  //       value: xt ? (isString(xt) ? xt : xt.join(", ")) : "...",
  //     },
  //     { field: "Trackers", value: tr ? (isString(tr) ? 1 : tr.length) : "..." },
  //   ];
  // }, [state.data]);
  // {magnet.map((row) => (
  //   <KeyValue key={row.field} {...row} />
  // ))}
  //

  return (
    <View style={styles.container}>
      <View style={styles.file}></View>
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
