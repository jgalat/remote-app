import * as React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "./screen";
import View from "./view";
import Text from "./text";
import Button from "./button";

type Props = {
  onAuth: () => void;
};

export default React.memo(function Auth({ onAuth }: Props) {
  const inset = useSafeAreaInsets();
  return (
    <Screen style={[StyleSheet.absoluteFill, inset, styles.container]}>
      <View style={styles.container}>
        <Text style={styles.title}>Remote for Transmission</Text>
        <Text style={styles.text}>Unlock to continue</Text>
        <Button onPress={onAuth} title="Authenticate" />
      </View>
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 24,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
  },
});
