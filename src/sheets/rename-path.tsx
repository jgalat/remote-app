import * as React from "react";
import { StyleSheet } from "react-native";
import _ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "~/components/text";
import View from "~/components/view";
import TextInput from "~/components/text-input";
import Button from "~/components/button";
import { useTheme } from "~/hooks/use-theme-color";
import { useRenamePath } from "~/hooks/torrent";
import { RENAME_PATH_SHEET_ID } from "./ids";

import type { SheetProps } from "react-native-actions-sheet";
import type { TorrentId, RenamePathKind } from "~/client";

export type Payload = {
  id: TorrentId;
  path: string;
  currentName: string;
  kind: RenamePathKind;
};

const ICON_BY_KIND: Record<RenamePathKind, "package" | "folder" | "file"> = {
  torrent: "package",
  folder: "folder",
  file: "file",
};

function RenamePathSheet({
  payload,
  ...props
}: SheetProps<typeof RENAME_PATH_SHEET_ID>) {
  const { background, text } = useTheme();
  const insets = useSafeAreaInsets();
  const renamePath = useRenamePath();

  const id = payload?.id;
  const path = payload?.path ?? "";
  const currentName = payload?.currentName ?? "";
  const kind: RenamePathKind = payload?.kind ?? "torrent";

  const [name, setName] = React.useState(currentName);

  React.useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const onRename = React.useCallback(() => {
    const trimmed = name.trim();
    if (id === undefined || !trimmed || trimmed === currentName) return;

    SheetManager.hide(RENAME_PATH_SHEET_ID);
    renamePath.mutate({ id, path, name: trimmed, kind });
  }, [id, path, name, currentName, kind, renamePath]);

  const trimmed = name.trim();
  const disabled = !trimmed || trimmed === currentName;

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
        <Text style={styles.title}>Rename</Text>
        <TextInput
          placeholder="new name"
          icon={ICON_BY_KIND[kind]}
          value={name}
          onChangeText={setName}
          autoFocus
          selectTextOnFocus
        />
        <Button
          title="rename"
          onPress={onRename}
          disabled={disabled}
          style={styles.button}
        />
      </View>
    </_ActionSheet>
  );
}

RenamePathSheet.sheetId = RENAME_PATH_SHEET_ID;

export default RenamePathSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
});
