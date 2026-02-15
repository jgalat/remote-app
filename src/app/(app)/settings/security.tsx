import * as React from "react";
import { StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useTranslation } from "react-i18next";

import Toggle from "~/components/toggle";
import View from "~/components/view";
import Screen from "~/components/screen";
import { usePreferencesStore } from "~/hooks/use-settings";

export default function SecurityScreen() {
  const { authentication, store } = usePreferencesStore();
  const { t } = useTranslation();

  const [available, setAvailable] = React.useState(false);

  React.useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setAvailable);
  }, []);

  const onUpdate = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: authentication ? t("disable") : t("enable"),
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
          label={t("authentication")}
          description={t("enable_local_authentication")}
          disabled={!available}
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
