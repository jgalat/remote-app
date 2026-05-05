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

export type EngineState =
  | "stopped"
  | "starting"
  | "running"
  | "stopping"
  | "error";

export type EngineEncryption = "forced" | "enabled" | "disabled";

export type EngineSettings = {
  downloadDir: string;
  listenPortStart: number;
  listenPortEnd: number;
  maxConnections: number;
  maxUploads: number;
  maxActiveDownloads: number;
  maxActiveSeeds: number;
  dht: boolean;
  pex: boolean;
  lsd: boolean;
  utp: boolean;
  encryption: EngineEncryption;
  uploadRateLimit: number;
  downloadRateLimit: number;
  seedRatioLimit: number;
};

export type EngineSessionStats = {
  numTorrents: number;
  numActive: number;
  numPaused: number;
  downloadRate: number;
  uploadRate: number;
  totalDownload: number;
  totalUpload: number;
  dhtNodes: number;
  listenPort: number;
};

export type LocalEngineStatus = {
  available: boolean;
  state: EngineState;
  stats: EngineSessionStats | null;
  settings: EngineSettings | null;
  error: string | null;
};

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
