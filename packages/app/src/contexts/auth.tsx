import * as React from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";

import { useAuthentication } from "~/hooks/use-settings";

export type Auth = {
  locked: boolean;
  unlock: () => void;
};

export const AuthContext = React.createContext<Auth | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const authentication = useAuthentication();
  const [locked, setLocked] = React.useState(authentication);

  const unlock = React.useCallback(async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    if (success) {
      setLocked(false);
      router.replace("/");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ locked, unlock }}>
      {children}
    </AuthContext.Provider>
  );
}
