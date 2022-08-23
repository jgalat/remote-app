import * as React from "react";
import { StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";

import Text from "../components/text";
import View from "../components/view";
import Button from "../components/button";
import { useTheme } from "../hooks/use-theme-color";
import { MagnetData, parseMagnet } from "../utils/parsers";
import { RootStackParamList } from "../types";
import { useAddTorrent, useFreeSpace } from "../hooks/use-transmission";
import { useServer } from "../hooks/use-settings";
import { formatSize } from "../utils/formatters";

export default function AddTorrentMagnetScreen() {
  const {
    params: { url },
  } =
    useRoute<
      NativeStackScreenProps<RootStackParamList, "AddTorrentMagnet">["route"]
    >();

  const { red } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const server = useServer();
  const add = useAddTorrent();
  const { data: freeSpace, error } = useFreeSpace();
  const [state, setState] = React.useState<{
    error?: string;
    url?: string;
    data?: MagnetData;
    sending?: boolean;
  }>({ sending: false });

  React.useEffect(() => {
    if (!server || error) {
      navigation.replace("Root");
    }
  }, [server, error]);

  React.useEffect(() => {
    if (url && url !== state.url) {
      setState({
        url,
        error: undefined,
        data: parseMagnet(url),
      });
    }
  }, [url]);

  const onPaste = React.useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text.startsWith("magnet:")) {
      setState({ url: text, error: undefined, data: parseMagnet(text) });
    } else {
      setState({ error: "Invalid Magnet URL" });
    }
  }, [setState]);

  const onAdd = React.useCallback(async () => {
    if (!state.url) {
      return;
    }
    setState({ ...state, sending: true });
    await add.magnet(state.url);
    navigation.popToTop();
  }, [state]);

  return (
    <View style={styles.container}>
      <Text style={styles.name} numberOfLines={1}>
        {state.data?.name ?? "Paste a URL"}
      </Text>
      <Button style={styles.button} title="Paste URL" onPress={onPaste} />
      <Button
        style={styles.button}
        disabled={!state.url}
        title={state.sending ? "Sending..." : "Add Torrent"}
        onPress={onAdd}
      />
      {state.error ? (
        <Text color={red} style={styles.error}>
          {state.error}
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
  name: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 20,
    fontWeight: "500",
  },
  error: {
    textAlign: "center",
    marginVertical: 16,
    fontSize: 16,
  },
  button: {},
  free: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 16,
  },
});
