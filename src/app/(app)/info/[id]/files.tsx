import * as React from "react";
import { FlatList, StyleSheet, BackHandler } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrentFiles, useTorrentSet } from "~/hooks/torrent";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import Separator from "~/components/separator";
import { useTheme } from "~/hooks/use-theme-color";
import Pressable from "~/components/pressable";
import FileItem, { type RenderFile } from "~/components/file-item";
import { Feather } from "@expo/vector-icons";
import Checkbox from "~/components/checkbox";
import { useFileActionsSheet } from "~/hooks/use-action-sheet";
import { useIsFocused } from "@react-navigation/native";
import useTorrentBrowser from "~/hooks/use-torrent-browser";

function FileRow({
  file,
  onPress,
  onLongPress,
  setWanted,
}: {
  file: RenderFile;
  onPress: (path: string) => void;
  onLongPress: (file: RenderFile) => void;
  setWanted: (file: RenderFile, value: boolean) => void;
}) {
  const handlePress = React.useCallback(
    () => onPress(file.path),
    [onPress, file.path]
  );
  const handleLongPress = React.useCallback(
    () => onLongPress(file),
    [onLongPress, file]
  );
  const handleCheckbox = React.useCallback(
    (value: boolean) => setWanted(file, value),
    [setWanted, file]
  );
  return (
    <FileItem
      onPress={file.isFile ? undefined : handlePress}
      onLongPress={handleLongPress}
      data={file}
      right={
        <Checkbox
          value={file.content.some((f) => f.wanted)}
          onPress={handleCheckbox}
        />
      }
    />
  );
}

export default function FilesScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrent, error, isLoading, refetch } = useTorrentFiles(id);
  const fileActionsSheet = useFileActionsSheet();
  const torrentSet = useTorrentSet(id);
  const isFocused = useIsFocused();
  const { text } = useTheme();

  const { items, canGoUp, goUp, enterFolder } = useTorrentBrowser(torrent);

  const onFilePress = React.useCallback(
    (path: string) => enterFolder(path),
    [enterFolder]
  );

  const onFileLongPress = React.useCallback(
    (file: RenderFile) =>
      fileActionsSheet({
        id,
        path: file.path,
        name: file.name,
        isFile: file.isFile,
        content: file.content.map((f) => f.id),
      }),
    [fileActionsSheet, id]
  );

  const setWanted = React.useCallback(
    (file: RenderFile, value: boolean) =>
      torrentSet.mutate({
        [value ? "files-wanted" : "files-unwanted"]: file.content.map(
          (f) => f.id
        ),
      }),
    [torrentSet]
  );

  const renderItem = React.useCallback(
    ({ item: file }: { item: RenderFile }) => (
      <FileRow
        file={file}
        onPress={onFilePress}
        onLongPress={onFileLongPress}
        setWanted={setWanted}
      />
    ),
    [onFilePress, onFileLongPress, setWanted]
  );

  React.useEffect(() => {
    if (!isFocused || !canGoUp) {
      return;
    }

    const action = () => {
      goUp();
      return true;
    };

    const handler = BackHandler.addEventListener("hardwareBackPress", action);
    return () => handler.remove();
  }, [isFocused, goUp, canGoUp]);

  if (error) {
    return <NetworkErrorScreen error={error} refetch={refetch} />;
  }

  if (isLoading || !torrent) {
    return <LoadingScreen />;
  }

  return (
    <Screen style={styles.container}>
      {canGoUp && (
        <Pressable style={styles.top} onPress={goUp}>
          <Feather
            style={{ marginRight: 16 }}
            name="arrow-up"
            color={text}
            size={20}
          />
          <Text>..</Text>
        </Pressable>
      )}
      <FlatList
        // fadingEdgeLength={64}
        data={items}
        renderItem={renderItem}
        keyExtractor={({ path }) => path}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>No files found</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 16,
    marginBottom: 8,
  },
  top: {
    flexDirection: "row",
    padding: 12,
  },
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
