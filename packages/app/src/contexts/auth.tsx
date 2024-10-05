import * as React from "react";
import { AppState } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";

import { useAuthentication } from "~/hooks/use-settings";

export type Auth = {
  lock: boolean;
  signIn: () => void;
};

export const AuthContext = React.createContext<Auth | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const authentication = useAuthentication();
  const [locked, setLocked] = React.useState(authentication);

  const signIn = React.useCallback(async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    setLocked(!success);
    router.replace("/");
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

  return (
    <AuthContext.Provider value={{ lock: locked, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
