import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import View from "./view";
import Text from "./text";
import ProgressBar from "./progress-bar";
import Pressable, { PressableProps } from "./pressable";
import { useTheme } from "~/hooks/use-theme-color";
import { getPriority, getWanted, type File } from "~/utils/file";
import { formatSize } from "~/utils/formatters";

export type RenderFile = {
  name: string;
  path: string;
  isFile: boolean;
  content: File[];
};

export type Props = {
  data: RenderFile;
  right?: React.ReactNode;
} & PressableProps;

export default React.memo(function FileItem({ data, right, ...props }: Props) {
  const { text, gray } = useTheme();

  const total = data.content.reduce((total, f) => total + f.length, 0);
  const downloaded = data.content.reduce(
    (total, f) => total + f.bytesCompleted,
    0
  );
  const progress = (total === 0 ? 0 : downloaded / total) * 100;
  const priority = getPriority(data.content);

  return (
    <Pressable {...props}>
      <View style={styles.container}>
        <View style={styles.left}>
          <Feather
            name={data.isFile ? "file" : "folder"}
            size={20}
            style={styles.icon}
            color={text}
          />
        </View>
        <View style={styles.stats}>
          <Text numberOfLines={1} style={styles.name}>
            {data.name}
          </Text>
          <ProgressBar
            style={styles.progress}
            progress={progress}
            color={text}
          />
          <View style={styles.row}>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
                {formatSize(downloaded)} / {formatSize(total)} (
                {progress.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.column}>
              <Text color={gray} style={styles.data}>
                {priority}
              </Text>
            </View>
          </View>
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  left: {
    flexDirection: "column",
    justifyContent: "center",
    marginRight: 8,
  },
  right: {
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 8,
  },
  stats: {
    flex: 1,
    flexShrink: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flexDirection: "column",
  },
  name: {
    fontFamily: "RobotoMono-Medium",
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    marginBottom: 2,
  },
  progress: {
    marginTop: 4,
    marginBottom: 4,
  },
  icon: {
    padding: 12,
  },
});
