import { StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

import Text from "../components/text";
import View from "../components/view";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AddTorrentStackParamList } from "../types";

export default function AddTorrentMagnetScreen() {
  const { params } =
    useRoute<
      NativeStackScreenProps<AddTorrentStackParamList, "Magnet">["route"]
    >();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{JSON.stringify({ ...params })}</Text>
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
    fontWeight: "500",
  },
});
