import * as React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import { useTheme } from "../hooks/use-theme-color";
import Text from "./text";

export type LinkProps = {
  to: string;
  title: string;
};

export default function Link({ to, title }: LinkProps) {
  const { tint } = useTheme();

  const goTo = React.useCallback(async () => {
    const supported = await Linking.canOpenURL(to);
    if (!supported) {
      return;
    }
    await Linking.openURL(to);
  }, [to]);

  return React.useMemo(
    () => (
      <Pressable
        style={(state) => ({
          opacity: state.pressed ? 0.5 : 1,
          ...styles.pressable,
        })}
        onPress={goTo}
      >
        <Text style={{ color: tint }}>{title} </Text>
        <Feather name="external-link" color={tint} size={16} />
      </Pressable>
    ),
    [title, goTo, tint]
  );
}

const styles = StyleSheet.create({
  pressable: {
    flexDirection: "row",
    alignItems: "center",
  },
});
