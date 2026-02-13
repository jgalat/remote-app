import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import View, { ViewProps } from "./view";
import Text from "./text";
import ActionIcon from "./action-icon";
import { useTheme } from "../hooks/use-theme-color";
import {
  useSession,
  useSessionSet,
  useSessionStats,
} from "../hooks/transmission";
import { formatSpeed } from "../utils/formatters";

export type StatsProps = ViewProps;

export default React.memo(function Stats({ style, ...props }: StatsProps) {
  const { text } = useTheme();
  const { data: session } = useSession();
  const { data: stats } = useSessionStats();
  const { mutate } = useSessionSet();

  return (
    <View style={[styles.container, style]} {...props}>
      <Text>
        <Feather name="arrow-down" color={text} />{" "}
        {formatSpeed(stats?.downloadSpeed ?? 0)}
      </Text>
      <View style={styles.alt}>
        <ActionIcon
          size={32}
          name={session?.["alt-speed-enabled"] ? "zap-off" : "zap"}
          onPress={() =>
            mutate({
              "alt-speed-enabled": !session?.["alt-speed-enabled"],
            })
          }
        />
      </View>
      <Text>
        {formatSpeed(stats?.uploadSpeed ?? 0)}{" "}
        <Feather name="arrow-up" color={text} />
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  alt: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
