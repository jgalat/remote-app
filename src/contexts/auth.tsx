import * as React from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";

import { useAuthentication } from "~/hooks/use-settings";

export type Auth = {
  locked: boolean;
  unlock: (href?: string) => void;
};

export const AuthContext = React.createContext<Auth | null>(null);

function validHref(href: string): href is "/add" | "/" {
  return href === "/" || href.startsWith("/add");
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const authentication = useAuthentication();
  const [locked, setLocked] = React.useState(authentication);
  const router = useRouter();

  const unlock = React.useCallback(
    async (href?: string) => {
      const { success } = await LocalAuthentication.authenticateAsync();
      if (success) {
        setLocked(false);
        const redirect = href ? decodeURIComponent(href) : "/";
        router.replace(validHref(redirect) ? redirect : "/");
      }
    },
    [router]
  );

  const value = React.useMemo(() => ({ locked, unlock }), [locked, unlock]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
