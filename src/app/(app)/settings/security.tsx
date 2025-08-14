import * as React from "react";
import { StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import Toggle from "~/components/toggle";
import View from "~/components/view";
import Screen from "~/components/screen";
import useSettings from "~/hooks/use-settings";

export default function SecurityScreen() {
  const { settings, store } = useSettings();
  const { authentication } = settings;

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
