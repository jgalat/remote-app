import * as React from "react";
import { Share, StyleSheet } from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { startActivityAsync } from "expo-intent-launcher";
import { File, Paths } from "expo-file-system/next";
import { Feather } from "@expo/vector-icons";

import Screen from "~/components/screen";
import View from "~/components/view";
import Text from "~/components/text";
import Pressable from "~/components/pressable";
import ActionIcon from "~/components/action-icon";
import { SettingsSectionTitle } from "~/components/settings";
import { useTheme } from "~/hooks/use-theme-color";

const RESPONSE_FILE = "debug-response.txt";

function Cell({ label, value, color, selectable, maxLines }: {
  label: string;
  value: string | number;
  color?: string;
  selectable?: boolean;
  maxLines?: number;
}) {
  const { gray } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const [clamped, setClamped] = React.useState(false);

  return (
    <Pressable
      style={styles.cell}
      disabled={!maxLines || !clamped}
      onPress={() => setExpanded((v) => !v)}
    >
      <Text color={gray} style={styles.cellLabel}>{label}</Text>
      <View style={styles.cellValue}>
        <Text
          selectable={selectable}
          color={color}
          style={styles.cellText}
          numberOfLines={maxLines && !expanded ? maxLines : undefined}
          onTextLayout={(e) => {
            if (maxLines && e.nativeEvent.lines.length >= maxLines) {
              setClamped(true);
            }
          }}
        >
          {value}
        </Text>
        {clamped && !expanded && (
          <Text color={gray} style={styles.showMore}>show more</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function DebugScreen() {
  const navigation = useNavigation();
  const { red, gray } = useTheme();
  const params = useLocalSearchParams<{
    url: string;
    username?: string;
    password?: string;
    errorName: string;
    errorMessage?: string;
    errorStatus?: string;
    hasBody?: string;
  }>();
  const [showPassword, setShowPassword] = React.useState(false);

  const errorStatus = params.errorStatus ? Number(params.errorStatus) : undefined;
  const hasBody = params.hasBody === "1";

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ActionIcon
          name="share-2"
          onPress={() => {
            const lines = [
              `URL: ${params.url}`,
              params.username ? `Username: ${params.username}` : null,
              `Error: ${params.errorName}`,
              params.errorMessage ? `Message: ${params.errorMessage}` : null,
              errorStatus != null ? `HTTP Status: ${errorStatus}` : null,
            ].filter(Boolean);
            Share.share({ message: lines.join("\n") });
          }}
        />
      ),
    });
  }, [navigation, params, errorStatus]);

  const openResponse = () => {
    const file = new File(Paths.cache, RESPONSE_FILE);
    if (!file.exists) return;
    startActivityAsync("android.intent.action.VIEW", {
      data: file.contentUri,
      flags: 1,
      type: "text/plain",
    });
  };

  return (
    <Screen variant="scroll" style={styles.screen}>
      <SettingsSectionTitle title="Request" variant="settings" first />
      <View style={styles.group}>
        <Cell label="URL" value={params.url} selectable />
        {params.username ? (
          <Cell label="Username" value={params.username} selectable />
        ) : null}
        {params.password ? (
          <Pressable
            style={styles.cell}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Text color={gray} style={styles.cellLabel}>Password</Text>
            <View style={styles.passwordValue}>
              <Text selectable={showPassword} style={[styles.cellText, { flex: 1 }]}>
                {showPassword ? params.password : "\u2022".repeat(params.password.length)}
              </Text>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={gray}
              />
            </View>
          </Pressable>
        ) : null}
      </View>

      <SettingsSectionTitle title="Error" variant="settings" />
      <View style={styles.group}>
        <Cell label="Type" value={params.errorName} color={red} />
        {errorStatus != null && (
          <Cell label="HTTP Status" value={errorStatus} color={red} />
        )}
        {params.errorMessage ? (
          <Cell label="Message" value={params.errorMessage} selectable maxLines={4} />
        ) : null}
      </View>

      {hasBody ? (
        <>
          <SettingsSectionTitle title="Response" variant="settings" />
          <Pressable style={styles.responseRow} onPress={openResponse}>
            <Feather name="file-text" size={16} color={gray} />
            <Text style={[styles.cellText, { flex: 1 }]}>Open response body</Text>
            <Feather name="chevron-right" size={18} color={gray} />
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 8,
  },
  group: {
    paddingHorizontal: 4,
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  cellLabel: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  cellValue: {
    flexDirection: "column",
  },
  cellText: {
    fontFamily: "RobotoMono-Regular",
    fontSize: 14,
  },
  showMore: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 12,
    marginTop: 4,
  },
  passwordValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  responseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
