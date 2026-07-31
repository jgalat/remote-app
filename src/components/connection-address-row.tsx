import * as React from "react";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import ActionIcon from "~/components/action-icon";
import Pressable from "~/components/pressable";
import Text from "~/components/text";
import View from "~/components/view";
import { useTheme } from "~/hooks/use-theme-color";
import { displayServerAddress } from "~/utils/server-address";

type ConnectionAddressRowProps = {
  label: string;
  url: string;
  primary?: boolean;
  onPress: () => void;
  onMore?: () => void;
};

export default React.memo(function ConnectionAddressRow({
  label,
  url,
  primary = false,
  onPress,
  onMore,
}: ConnectionAddressRowProps) {
  const { gray, text, tint } = useTheme();
  const address = displayServerAddress(url);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.address}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${address}`}
      >
        <Feather
          name={primary ? "home" : "link"}
          size={20}
          color={primary ? tint : text}
        />
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          <Text color={gray} numberOfLines={1} style={styles.url}>
            {address}
          </Text>
        </View>
        {!onMore ? <Feather name="chevron-right" size={20} color={gray} /> : null}
      </Pressable>
      {onMore ? (
        <ActionIcon
          name="more-vertical"
          onPress={onMore}
          accessibilityLabel={`More actions for ${label}`}
          style={styles.more}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    flex: 1,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  label: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 14,
  },
  url: {
    fontSize: 12,
  },
  more: {
    paddingHorizontal: 12,
  },
});
