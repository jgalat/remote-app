import * as React from "react";
import { Image, Linking, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";

import Screen from "~/components/screen";
import View from "~/components/view";
import Text from "~/components/text";
import Pressable from "~/components/pressable";
import { useTheme } from "~/hooks/use-theme-color";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require("../../../../assets/images/icon.png");

export default function AboutScreen() {
  const { tint, gray, lightGray } = useTheme();
  const { t } = useTranslation();

  const links = [
    {
      title: t("about_website"),
      description: t("about_website_desc"),
      url: "https://remote.jg.ar",
    },
    {
      title: t("about_wiki"),
      description: t("about_wiki_desc"),
      url: "https://github.com/jgalat/remote-app/wiki",
    },
    {
      title: t("about_repository"),
      description: t("about_repository_desc"),
      url: "https://github.com/jgalat/remote-app",
    },
    {
      title: t("about_issues"),
      description: t("about_issues_desc"),
      url: "https://github.com/jgalat/remote-app/issues",
    },
  ];

  return (
    <Screen variant="scroll" contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={icon}
          style={styles.icon}
        />
        <Text style={styles.title}>{t("remote_for_transmission")}</Text>
        <Text style={[styles.version, { color: lightGray }]}>
          {Constants.expoConfig?.version}
        </Text>
      </View>
      {links.map((link) => (
        <Pressable
          key={link.url}
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
    paddingHorizontal: 4,
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
