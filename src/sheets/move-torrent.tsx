import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import _ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";

import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import { useTheme } from "~/hooks/use-theme-color";
import { useSession, useTorrentSetLocation } from "~/hooks/torrent";
import {
  useActiveServerId,
  useDirectories,
} from "~/hooks/use-settings";
import { MOVE_TORRENT_SHEET_ID, SELECT_SHEET_ID } from "./ids";

import type { SheetProps } from "react-native-actions-sheet";
import type { SelectOption } from "./select";
import type { TorrentId } from "~/client";

export type Payload = {
  ids: TorrentId[];
  downloadDir?: string;
};

function MoveTorrentSheet({
  payload: { ids, downloadDir } = { ids: [] },
  ...props
}: SheetProps<typeof MOVE_TORRENT_SHEET_ID>) {
  const { background, text } = useTheme();
  const { data: session } = useSession({ stale: true });
  const serverId = useActiveServerId();
  const directories = useDirectories(serverId);
  const setLocation = useTorrentSetLocation();

  const initialDir = downloadDir ?? session?.["download-dir"] ?? "";
  const [location, setLocationText] = React.useState(initialDir);

  React.useEffect(() => {
    if (initialDir) setLocationText(initialDir);
  }, [initialDir]);

  const defaultDir = session?.["download-dir"];

  const onPickDirectory = React.useCallback(() => {
    const allDirs = [
      ...(defaultDir ? [defaultDir] : []),
      ...directories,
    ];
    const unique = [...new Set(allDirs)];
    if (unique.length === 0) return;

    const options: SelectOption[] = unique.map((dir) => ({
      label: dir,
      value: dir,
      left: "folder" as const,
    }));

    SheetManager.show(SELECT_SHEET_ID, {
      payload: {
        title: "Select directory",
        options,
        onSelect: (value) => setLocationText(String(value)),
      },
    });
  }, [defaultDir, directories]);

  React.useEffect(() => {
    if (!setLocation.isSuccess) return;
    void SheetManager.hide(MOVE_TORRENT_SHEET_ID);
    ToastAndroid.show("Torrent moved", ToastAndroid.SHORT);
  }, [setLocation.isSuccess]);

  const onMove = React.useCallback(() => {
    if (setLocation.isPending || !location.trim() || ids.length === 0) return;

    setLocation.mutate({ ids, location: location.trim(), move: true });
  }, [ids, location, setLocation]);

  const disabled = setLocation.isPending || !location.trim() || ids.length === 0;

  return (
    <_ActionSheet
      id={props.sheetId}
      containerStyle={{
        backgroundColor: background,
        borderWidth: 2,
        borderColor: text,
        borderBottomWidth: 0,
      }}
      indicatorStyle={{
        backgroundColor: text,
        marginTop: 12,
        height: 4,
      }}
      useBottomSafeAreaPadding
      gestureEnabled={!setLocation.isPending}
      closable={!setLocation.isPending}
      closeOnTouchBackdrop={!setLocation.isPending}
      closeOnPressBack={!setLocation.isPending}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Move</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="/downloads"
            icon="folder"
            editable={!setLocation.isPending}
            value={location}
            onChangeText={setLocationText}
            containerStyle={styles.input}
          />
          <Pressable
            style={styles.pickButton}
            onPress={onPickDirectory}
            disabled={setLocation.isPending}
          >
            <Feather name="book" size={20} color={text} />
          </Pressable>
        </View>
        <Button
          title={setLocation.isPending ? "moving…" : "move"}
          accessibilityState={{ busy: setLocation.isPending, disabled }}
          onPress={onMove}
          disabled={disabled}
          style={styles.button}
        />
      </View>
    </_ActionSheet>
  );
}

MoveTorrentSheet.sheetId = MOVE_TORRENT_SHEET_ID;

export default MoveTorrentSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
  },
  pickButton: {
    height: 48,
    width: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
});
