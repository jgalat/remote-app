import * as React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { MagnetData, magnetDecode } from "@ctrl/magnet-link";

import Text from "../components/text";
import View from "../components/view";
import Button from "../components/button";
import KeyValue from "../components/key-value";
import { useTheme } from "../hooks/use-theme-color";
import { RootStackParamList } from "../types";
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { formatSize } from "../utils/formatters";

export default function AddTorrentMagnetScreen() {
  const {
    params: { uri },
  } =
    useRoute<
      NativeStackScreenProps<RootStackParamList, "AddTorrentMagnet">["route"]
    >();

  const { red } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const add = useAddTorrent();
  const { data: freeSpace, error } = useFreeSpace();
  const [state, setState] = React.useState<{
    error?: string;
    uri?: string;
    data?: MagnetData;
    sending?: boolean;
  }>({ sending: false });

  React.useEffect(() => {
    if (uri && uri !== state.uri) {
      setState({
        uri,
        error: undefined,
        data: magnetDecode(uri),
      });
    }
  }, [uri]);

  const onPaste = React.useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text.startsWith("magnet:")) {
      setState({ uri: text, error: undefined, data: magnetDecode(text) });
    } else {
      setState({ error: "Invalid Magnet URL" });
    }
  }, [setState]);

  const onAdd = React.useCallback(async () => {
    if (!state.uri) {
      return;
    }

    setState({ ...state, sending: true });
    try {
      await add.magnet(state.uri);
      navigation.popToTop();
    } catch (e) {
      setState({ ...state, sending: false, error: e.message });
    }
  }, [state]);

  const magnet = React.useMemo(() => {
    const { dn, xt, tr, xl } = state.data ?? {};

    return [
      {
        field: "Name",
        value: dn ? dn.toString() : "...",
      },
      {
        field: "Hash",
        value: xt ? xt.toString() : "...",
      },
      {
        field: "Size",
        value: xl ? formatSize(+xl) : "...",
      },
      {
        field: "Trackers",
        value: tr ? (typeof tr === "string" ? 1 : tr.length) : "...",
      },
    ];
  }, [state.data]);

  return (
    <View style={styles.container}>
      <View style={styles.magnet}>
        {magnet.map((row) => (
          <KeyValue key={row.field} {...row} />
        ))}
      </View>
      <Button title="Paste URL" onPress={onPaste} />
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
  magnet: {
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
