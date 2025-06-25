import * as React from "react";
import { StyleSheet } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import Toggle from "~/components/toggle";
import Text from "~/components/text";
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
      <Text style={[styles.title, { marginTop: 0 }]}>Authentication</Text>

      <View style={styles.row}>
        <Toggle
          value={authentication}
          onPress={onUpdate}
          label="Enable local authentication"
          disabled={!available}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 16,
    marginTop: 24,
  },
  row: {
    marginBottom: 24,
  },
});
