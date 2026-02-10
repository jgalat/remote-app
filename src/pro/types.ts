export type ProFeature = "multi-server" | "search";

export type ProContextValue = {
  available: boolean;
  isPro: boolean;
  isLoading: boolean;
  price: string | null;
  purchasePro: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  canUse: (feature: ProFeature) => boolean;
  devOverride: boolean;
  setDevOverride: (value: boolean) => void;
  debugLog: string[];
};

export type EntitlementState = {
  isPro: boolean;
  source: "revenuecat" | "cache" | "stub";
  lastCheckedAt: number;
};

export type SearchResult = {
  title: string;
  size: number;
  seeders: number;
  leechers: number;
  magnetUrl?: string;
  torrentUrl?: string;
  date?: string;
  indexer?: string;
};

export type SearchConfig = { url: string; apiKey: string; type: "jackett" | "prowlarr" };

export interface ProModule {
  initialize(config: {
    androidApiKey?: string;
    entitlementId?: string;
    offeringId?: string;
  }): Promise<void>;
  getEntitlement(): Promise<EntitlementState>;
  purchasePro(): Promise<EntitlementState>;
  restorePurchases(): Promise<EntitlementState>;
  getPrice(): Promise<string | null>;
  search(config: SearchConfig, query: string): Promise<SearchResult[]>;
  testSearchConnection(config: SearchConfig): Promise<void>;
}
