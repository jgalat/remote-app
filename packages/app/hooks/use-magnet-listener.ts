import * as React from "react";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AddTorrentStackParamList } from "../types";

export default function useMagnetListener() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AddTorrentStackParamList>>();

  React.useEffect(() => {
    async function loadUrl() {
      const url = await Linking.getInitialURL();
      if (!url || !url.startsWith("magnet:")) {
        return;
      }

      navigation.navigate("Magnet", { url });
    }

    loadUrl();
  }, [navigation]);

  React.useEffect(() => {
    const listener = ({ url }: { url: string }) => {
      if (url.startsWith("magnet:")) {
        navigation.navigate("Magnet", { url });
      }
    };

    Linking.addEventListener("url", listener);

    return Linking.removeEventListener("url", listener);
  }, [navigation]);
}
