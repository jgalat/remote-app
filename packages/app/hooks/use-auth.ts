import * as React from "react";
import { AppState } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

import { useAuthentication } from "./use-settings";

export default function useAuth() {
  const authentication = useAuthentication();
  const [locked, setLocked] = React.useState(authentication);

  const onAuth = React.useCallback(async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    if (!success) {
      return;
    }
    setLocked(false);
  }, []);

  React.useEffect(() => {
    if (!authentication) {
      return;
    }

    const sub = AppState.addEventListener("change", (state) => {
      if (/background|inactive/.test(state)) {
        setLocked(true);
      }
    });
    return () => {
      sub.remove();
    };
  }, [authentication]);

  return { locked, onAuth };
}
