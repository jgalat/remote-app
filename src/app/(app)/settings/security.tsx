import * as React from "react";
import { StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useQuery } from "@tanstack/react-query";

import Toggle from "~/components/toggle";
import View from "~/components/view";
import Screen from "~/components/screen";
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

export default function SecurityScreen() {
  const { authentication, store } = usePreferencesStore();

  const { data: available = false, refetch } = useQuery({
    queryKey: ["security", "local-auth-availability"],
    queryFn: loadLocalAuthenticationAvailability,
    staleTime: Infinity,
  });

  const onUpdate = async () => {
    try {
      const availability = await refetch();
      if (!availability.data) {
        return;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: authentication ? "Disable" : "Enable",
      });
      if (!success) {
        return;
      }

      store({ authentication: !authentication });
    } catch {
      // ignore
    }
  };

  return (
    <Screen>
      <View style={styles.row}>
        <Toggle
          value={authentication}
          onPress={onUpdate}
          label="AUTHENTICATION"
          description="Enable local authentication"
          disabled={!authentication && !available}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 24,
  },
});
