import * as React from "react";
import { FlatList, StyleSheet, BackHandler } from "react-native";
import { useGlobalSearchParams } from "expo-router";

import Text from "~/components/text";
import View from "~/components/view";
import Screen from "~/components/screen";
import { useTorrent, useTorrentSet } from "~/hooks/transmission";
import {
  LoadingScreen,
  NetworkErrorScreen,
} from "~/components/utility-screens";
import Separator from "~/components/separator";
import { useTheme } from "~/hooks/use-theme-color";
import Pressable from "~/components/pressable";
import FileItem from "~/components/file-item";
import { Feather } from "@expo/vector-icons";
import Checkbox from "~/components/checkbox";
import { useTorrentPrioritySheet } from "~/hooks/use-action-sheet";
import { useIsFocused } from "@react-navigation/native";
import useTorrentBrowser from "~/hooks/use-torrent-browser";
import { useTranslation } from "react-i18next";

export default function FilesScreen() {
  const { id } = useGlobalSearchParams<{ id: string }>();
  const { data: torrents, error, isLoading, refetch } = useTorrent(+id);
  const prioritySheet = useTorrentPrioritySheet(+id);
  const torrentSet = useTorrentSet(+id);
  const isFocused = useIsFocused();
  const { text } = useTheme();
  const { t } = useTranslation();

  const { items, canGoUp, goUp, enterFolder } = useTorrentBrowser(
    torrents ?? []
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

  if (isLoading || !torrents || torrents.length !== 1) {
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
        renderItem={({ item: file }) => (
          <FileItem
            onPress={file.isFile ? undefined : () => enterFolder(file.path)}
            onLongPress={() =>
              prioritySheet({ content: file.content.map((f) => f.id) })
            }
            data={file}
            right={
              <Checkbox
                value={file.content.some((f) => f.wanted)}
                onPress={(value) =>
                  torrentSet.mutate({
                    [value ? "files-wanted" : "files-unwanted"]:
                      file.content.map((f) => f.id),
                  })
                }
              />
            }
          />
        )}
        keyExtractor={({ path }) => path}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.message}>
            <Text style={styles.title}>{t("no_files_found")}</Text>
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
