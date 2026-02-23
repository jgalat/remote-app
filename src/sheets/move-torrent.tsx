import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import _ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import { useTheme } from "~/hooks/use-theme-color";
import { useSession, useTorrentSetLocation } from "~/hooks/torrent";
import { useActiveServerId, useDirectories } from "~/hooks/use-settings";
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
  const insets = useSafeAreaInsets();
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

  const onMove = React.useCallback(() => {
    if (!location.trim()) return;

    SheetManager.hide(MOVE_TORRENT_SHEET_ID);
    setLocation.mutate(
      { ids, location: location.trim(), move: true },
      {
        onSuccess: () => {
          ToastAndroid.show("Torrent moved", ToastAndroid.SHORT);
        },
      }
    );
  }, [ids, location, setLocation]);

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
      openAnimationConfig={{ speed: 50, bounciness: 0 }}
      closeAnimationConfig={{ speed: 50, bounciness: 0 }}
      gestureEnabled
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Text style={styles.title}>Move</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="/downloads"
            icon="folder"
            value={location}
            onChangeText={setLocationText}
            containerStyle={styles.input}
          />
          <Pressable style={styles.pickButton} onPress={onPickDirectory}>
            <Feather name="book" size={20} color={text} />
          </Pressable>
        </View>
        <Button
          title="move"
          onPress={onMove}
          disabled={!location.trim()}
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
