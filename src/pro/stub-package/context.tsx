import * as React from "react";
import type { ProContextValue } from "~/pro/types";
import useNonNullContext from "~/hooks/use-non-null-context";

const stubValue: ProContextValue = {
  available: false,
  isPro: false,
  isLoading: false,
  price: null,
  purchasePro: async () => {},
  restorePurchases: async () => false,
  switchAppId: async () => false,
  canUse: () => false,
  devOverride: false,
  setDevOverride: () => {},
};

export const ProContext = React.createContext<ProContextValue | null>(null);
ProContext.displayName = "ProContext";

export function ProProvider({ children }: React.PropsWithChildren) {
  return <ProContext.Provider value={stubValue}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  return useNonNullContext(ProContext);
}
