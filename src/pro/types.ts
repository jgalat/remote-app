export type ProContextValue = {
  available: boolean;
  isPro: boolean;
  devOverride: boolean;
  setDevOverride: (value: boolean) => void;
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
  switchUser(appId: string): Promise<EntitlementState>;
  search(config: SearchConfig, query: string): Promise<SearchResult[]>;
  testSearchConnection(config: SearchConfig): Promise<void>;
}
