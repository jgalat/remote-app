import * as React from "react";
import { Image, Linking, StyleSheet, ToastAndroid } from "react-native";
import { Feather } from "@expo/vector-icons";

import Screen from "~/components/screen";
import View from "~/components/view";
import Text from "~/components/text";
import Pressable from "~/components/pressable";
import { SettingsListRow } from "~/components/settings";
import { useTheme } from "~/hooks/use-theme-color";
import { usePreferencesStore } from "~/hooks/use-settings";
import { getAppVersion } from "~/utils/app-version";

const tapsToEnable = 10;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require("../../../../assets/images/icon.png");

const links = [
  {
    title: "Website",
    description: "Official homepage",
    url: "https://remote.jg.ar",
  },
  {
    title: "Wiki",
    description: "Documentation, setup guides, and troubleshooting",
    url: "https://github.com/jgalat/remote-app/wiki",
  },
  {
    title: "Repository",
    description: "Browse the source code and track development",
    url: "https://github.com/jgalat/remote-app",
  },
  {
    title: "Issue Tracker",
    description: "Report bugs and request features",
    url: "https://github.com/jgalat/remote-app/issues",
  },
];

export default function AboutScreen() {
  const { tint, gray, lightGray } = useTheme();
  const appVersion = getAppVersion();
  const { developmentMode, store } = usePreferencesStore();
  const taps = React.useRef(0);

  const onVersionPress = React.useCallback(() => {
    if (developmentMode) return;
    taps.current += 1;
    if (taps.current < tapsToEnable) return;
    taps.current = 0;
    store({ developmentMode: true });
    ToastAndroid.show("Development mode enabled", ToastAndroid.SHORT);
  }, [developmentMode, store]);

  return (
    <Screen variant="scroll" contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={icon}
          style={styles.icon}
        />
        <Text style={styles.title}>Remote for Transmission</Text>
        <Pressable onPress={onVersionPress}>
          <Text style={[styles.version, { color: lightGray }]}>
            {appVersion}
          </Text>
        </Pressable>
      </View>
      {links.map((link) => (
        <SettingsListRow key={link.url} style={styles.cardWrap}>
          <Pressable
            style={styles.card}
            onPress={() => Linking.openURL(link.url).catch(() => undefined)}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: tint }]}>
                {link.title}{" "}
              </Text>
              <Feather name="external-link" color={tint} size={16} />
            </View>
            <Text style={[styles.cardDescription, { color: gray }]}>
              {link.description}
            </Text>
          </Pressable>
        </SettingsListRow>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 4,
  },
  version: {
    fontFamily: "RobotoMono-Regular",
    fontSize: 14,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cardWrap: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 16,
  },
  cardDescription: {
    fontFamily: "RobotoMono-Regular",
    fontSize: 13,
  },
});
