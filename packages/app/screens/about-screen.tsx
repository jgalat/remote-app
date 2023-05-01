import * as React from "react";
import { StyleSheet } from "react-native";

import Screen from "../components/screen";
import View from "../components/view";
import Text from "../components/text";
import Link from "../components/link";

export default function AboutScreen() {
  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Remote for Transmission</Text>
      <View style={styles.link}>
        <Link title="Website" to="https://remote.jg.ar" />
      </View>
      <View style={styles.link}>
        <Link
          title="GitHub Repository"
          to="https://github.com/jgalat/remote-app"
        />
      </View>
      <View style={styles.link}>
        <Link
          title="Wiki"
          to="https://github.com/jgalat/remote-app/wiki"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 24,
  },
  link: {
    marginBottom: 16,
  },
});
