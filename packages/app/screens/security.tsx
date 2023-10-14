import * as React from "react";
import { StyleSheet } from "react-native";

import Toggle from "../components/toggle";
import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";

export default function SecurityScreen() {
  return (
    <Screen variant="scroll">
      <Text style={[styles.title, { marginTop: 0 }]}>Authentication</Text>

      <View style={styles.row}>
        <View style={styles.label}>
          <Toggle value={true} onPress={() => {}} label="Enable local authentitaction" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 16,
    marginTop: 24,
  },
  row: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 16,
  },
});
