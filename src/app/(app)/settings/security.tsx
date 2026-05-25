import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useQuery } from "@tanstack/react-query";

import Option, { type OptionProps } from "~/components/option";
import Screen from "~/components/screen";
import View from "~/components/view";
import { usePreferencesStore } from "~/hooks/use-settings";

async function loadLocalAuthenticationAvailability(): Promise<boolean> {
  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export default function AuthenticationScreen() {
  const { authentication, store } = usePreferencesStore();

  const { data: available = false, refetch } = useQuery({
    queryKey: ["authentication", "local-auth-availability"],
    queryFn: loadLocalAuthenticationAvailability,
    staleTime: Infinity,
  });

  const select = React.useCallback(
    (nextValue: boolean) => async () => {
      if (nextValue === authentication) {
        return;
      }

      try {
        const availability = await refetch();
        if (!availability.data) {
          return;
        }

        const { success } = await LocalAuthentication.authenticateAsync({
          promptMessage: nextValue
            ? "Enable authentication"
            : "Disable authentication",
        });
        if (!success) {
          return;
        }

        store({ authentication: nextValue });
      } catch {
        // ignore
      }
    },
    [authentication, refetch, store]
  );

  const options = React.useMemo<OptionProps[]>(
    () => [
      {
        left: "lock",
        label: "On",
        right: authentication ? "check" : undefined,
        onPress: select(true),
        disabled: !available,
        variant: "compact",
      },
      {
        left: "unlock",
        label: "Off",
        right: !authentication ? "check" : undefined,
        onPress: select(false),
        disabled: !available,
        variant: "compact",
      },
    ],
    [authentication, available, select]
  );

  return (
    <Screen>
      <FlatList
        data={options}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index === options.length - 1 && styles.rowLast]}>
            <Option {...item} />
          </View>
        )}
        keyExtractor={(item) => item.label}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 8,
  },
  rowLast: {
    marginBottom: 12,
  },
});
