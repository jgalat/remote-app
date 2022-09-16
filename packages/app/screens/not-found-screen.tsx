import { StyleSheet } from "react-native";
import { useLinkTo, useRoute } from "@react-navigation/native";

import Text from "../components/text";
import View from "../components/view";
import Pressable from "../components/pressable";

export default function NotFoundScreen() {
  const linkTo = useLinkTo();
  const route = useRoute();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{JSON.stringify(route)}</Text>
      <Pressable onPress={() => linkTo("/")} style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "RobotoMono-Medium",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
