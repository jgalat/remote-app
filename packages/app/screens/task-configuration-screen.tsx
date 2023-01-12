import * as React from "react";
import { StyleSheet } from "react-native";

import Checkbox from "../components/checkbox";
import Text from "../components/text";
import View from "../components/view";
import Screen from "../components/screen";
import useSettings from "../hooks/use-settings";
import {
  isTorrentsNotifierTaskRegistered,
  registerTorrentsNotifierTask,
  unregisterTorrentsNotifierTask,
} from "../tasks/torrents-notifier";

export default function TaskConfigurationScreen() {
  const { store } = useSettings();
  const [state, setState] = React.useState<boolean>(false);

  const check = React.useCallback(async () => {
    const isTaskRegistered = await isTorrentsNotifierTaskRegistered();
    setState(isTaskRegistered);
  }, []);

  React.useLayoutEffect(() => {
    check();
  }, [check]);

  const onPress = React.useCallback(async () => {
    const isTaskRegistered = await isTorrentsNotifierTaskRegistered();
    if (isTaskRegistered) {
      await unregisterTorrentsNotifierTask();
    } else {
      await registerTorrentsNotifierTask();
    }
    await store({ notifications: !isTaskRegistered });
    await check();
  }, [store, check]);

  return (
    <Screen variant="scroll">
      <Text style={styles.title}>Finished torrents</Text>
      <View style={styles.row}>
        <Checkbox
          value={state}
          onPress={onPress}
          label="Background check every 5'"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "RobotoMono-Medium",
    fontSize: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
