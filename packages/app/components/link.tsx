import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import Text from "./text";
import Pressable from "./pressable";
import { useTheme } from "../hooks/use-theme-color";

export type LinkProps = {
  to: string;
  title: string;
};

export default function Link({ to, title }: LinkProps) {
  const { tint } = useTheme();

  const goTo = React.useCallback(
    () => Linking.openURL(to).catch(() => {}),
    [to]
  );

  return React.useMemo(
    () => (
      <Pressable style={styles.link} onPress={goTo}>
        <Text style={{ color: tint }}>{title} </Text>
        <Feather name="external-link" color={tint} size={16} />
      </Pressable>
    ),
    [title, goTo, tint]
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
});
