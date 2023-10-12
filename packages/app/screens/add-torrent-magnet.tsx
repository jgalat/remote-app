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
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { formatSize } from "../utils/formatters";
import type { RootStackParamList } from "../types";

type State = {
  error?: string;
  uri?: string;
  data?: MagnetData;
};

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
  const addTorrent = useAddTorrent();
  const freeSpace = useFreeSpace();
  const [state, setState] = React.useReducer(
    (prev: State, s: Partial<State>) => ({ ...prev, ...s }),
    {}
  );

  React.useEffect(() => {
    if (uri) {
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
  }, []);

  const onAdd = React.useCallback(async () => {
    if (!state.uri) {
      return;
    }

    try {
      await addTorrent.mutateAsync({ filename: state.uri });
      navigation.popToTop();
    } catch (e) {
      let message = "Something went wrong";
      if (e instanceof Error) {
        message = e.message;
      }
      setState({ error: message });
    }
  }, [addTorrent, navigation, state.uri]);

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
