import * as React from "react";
import { StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { magnetDecode } from "@ctrl/magnet-link";

import Text from "~/components/text";
import View from "~/components/view";
import Button from "~/components/button";
import KeyValue from "~/components/key-value";
import { useTheme } from "~/hooks/use-theme-color";
import { useAddTorrent, useFreeSpace } from "~/hooks/use-transmission";
import { formatSize } from "~/utils/formatters";

type State = {
  error?: string;
};

export default function AddTorrentMagnetScreen() {
  const { red } = useTheme();
  const addTorrent = useAddTorrent();
  const freeSpace = useFreeSpace();

  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const [state, setState] = React.useReducer(
    (prev: State, s: Partial<State>) => ({ ...prev, ...s }),
    {}
  );

  const onPaste = React.useCallback(async () => {
    const text = await Clipboard.getStringAsync();
    if (text.startsWith("magnet:")) {
      setState({ error: undefined });
      router.setParams({ uri: text });
    } else {
      setState({ error: "Invalid Magnet URL" });
    }
  }, []);

  const onAdd = React.useCallback(async () => {
    if (!uri) {
      return;
    }

    try {
      await addTorrent.mutateAsync({ filename: uri });
      router.dismiss();
    } catch (e) {
      let message = "Something went wrong";
      if (e instanceof Error) {
        message = e.message;
      }
      setState({ error: message });
    }
  }, [addTorrent, uri]);

  const magnet = React.useMemo(() => {
    const { dn, xt, tr, xl } = uri
      ? magnetDecode(uri)
      : { dn: "", xt: "", tr: "", xl: "" };

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
  }, [uri]);

  return (
    <View style={styles.container}>
      <View style={styles.magnet}>
        {magnet.map((row) => (
          <KeyValue key={row.field} {...row} />
        ))}
      </View>
      <Button title="Paste URL" onPress={onPaste} />
      <Button
        disabled={!uri || freeSpace.isError}
        title={addTorrent.isPending ? "Sending..." : "Add Torrent"}
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
