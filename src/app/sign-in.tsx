import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Screen from "~/components/screen";
import Text from "~/components/text";
import Button from "~/components/button";
import useAuth from "~/hooks/use-auth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const icon = require("../../assets/images/icon.png");

export default function SignIn() {
  const { unlock } = useAuth();
  const insets = useSafeAreaInsets();
  const { href } = useLocalSearchParams<{ href?: string }>();
  const footerStyle = React.useMemo(
    () => [styles.footer, { paddingBottom: Math.max(insets.bottom, 8) }],
    [insets.bottom]
  );

  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <Image
          source={icon}
          style={styles.icon}
        />
        <Text style={styles.title}>Remote for Transmission</Text>
        <Text style={styles.subtitle}>Unlock to continue</Text>
      </View>
      <View style={footerStyle}>
        <Button
          style={styles.button}
          onPress={() => unlock(href)}
          title="Authenticate"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  footer: {
    width: "100%",
  },
  button: {
    width: "100%",
  },
});
