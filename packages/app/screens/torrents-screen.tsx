import { StyleSheet } from "react-native";

import EditScreenInfo from "../components/edit-screen-info";
import { Text, View } from "../components/themed";
import { HomeStackScreenProps } from "../types";

export default function HomeScreen({
  navigation,
}: HomeStackScreenProps<"Home">) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="/screens/tab-one-screen.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
