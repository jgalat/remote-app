import type { ProModule, EntitlementState } from "../types";

const stubEntitlement: EntitlementState = {
  isPro: false,
  source: "stub",
  lastCheckedAt: Date.now(),
};

export function createProModule(): ProModule {
  return {
    async initialize() {},
    async getEntitlement() {
      return stubEntitlement;
    },
    async purchasePro() {
      return stubEntitlement;
    },
    async restorePurchases() {
      return stubEntitlement;
    },
    async getPrice() {
      return null;
    },
    async search() {
      return [];
    },
    async testSearchConnection() {},
  };
}
