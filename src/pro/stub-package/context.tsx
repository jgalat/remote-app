import * as React from "react";
import type { ProContextValue } from "~/pro/types";

const stubValue: ProContextValue = {
  available: false,
  isPro: false,
  isLoading: false,
  price: null,
  purchasePro: async () => {},
  restorePurchases: async () => false,
  canUse: () => false,
  devOverride: false,
  setDevOverride: () => {},
  debugLog: [],
};

export const ProContext = React.createContext<ProContextValue | null>(stubValue);

export function ProProvider({ children }: React.PropsWithChildren) {
  return <ProContext.Provider value={stubValue}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  return React.useContext(ProContext) as ProContextValue;
}
