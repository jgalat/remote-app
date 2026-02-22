import type {
  QBittorrentConfig,
  TorrentInfo,
  TorrentInfoParams,
  TorrentProperties,
  TorrentFile,
  TorrentTracker,
  TorrentPeersResponse,
  TransferInfo,
  Preferences,
  AddTorrentParams,
} from "./types";
import { HTTPError, QBittorrentError } from "./error";

export class QBittorrentClient {
  private sid: string | null = null;
  private loggedIn = false;
  private loginPromise: Promise<void> | null = null;

  constructor(private config: QBittorrentConfig) {}

  private baseUrl(): string {
    return this.config.url.replace(/\/+$/, "");
  }

  private async login(): Promise<void> {
    if (this.loginPromise) return this.loginPromise;
    this.loginPromise = this.doLogin();
    try {
      await this.loginPromise;
    } finally {
      this.loginPromise = null;
    }
  }

  private async doLogin(): Promise<void> {
    const baseUrl = this.baseUrl();
    const body = new URLSearchParams();
    if (this.config.username) body.set("username", this.config.username);
    if (this.config.password) body.set("password", this.config.password);

    const response = await fetch(`${baseUrl}/api/v2/auth/login`, {
      method: "POST",
      headers: {
        Referer: baseUrl,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: body.toString(),
    });

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }

    const text = await response.text();
    if (text !== "Ok.") {
      throw new QBittorrentError("Login failed: invalid credentials");
    }

    const cookie = response.headers.get("set-cookie");
    if (cookie) {
      const match = cookie.match(/SID=([^;]+)/);
      if (match) {
        this.sid = match[1];
      }
    }

    this.loggedIn = true;
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, params);
  }

  private async post<T = void>(path: string, body?: URLSearchParams | FormData): Promise<T> {
    return this.request<T>("POST", path, undefined, body);
  }

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: URLSearchParams | FormData,
    retry = true,
  ): Promise<T> {
    if (!this.loggedIn) {
      await this.login();
    }

    const baseUrl = this.baseUrl();
    let url = `${baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams(params);
      url += `?${qs.toString()}`;
    }

    const headers: Record<string, string> = {
      Referer: baseUrl,
    };
    if (this.sid) {
      headers["Cookie"] = `SID=${this.sid}`;
    }

    // URLSearchParams is not a valid fetch body type in React Native
    let fetchBody: string | FormData | undefined;
    if (body instanceof URLSearchParams) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      fetchBody = body.toString();
    } else {
      fetchBody = body;
    }

    const response = await fetch(url, { method, headers, body: fetchBody, credentials: "include" });

    if (response.status === 403 && retry) {
      this.sid = null;
      this.loggedIn = false;
      return this.request<T>(method, path, params, body, false);
    }

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }

    const text = await response.text();
    if (!text) return undefined as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as T;
    }
  }

  private hashes(hashes: string[]): string {
    return hashes.join("|");
  }

  // Torrents

  async info(params?: TorrentInfoParams): Promise<TorrentInfo[]> {
    const qs: Record<string, string> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs[key] = String(value);
      }
    }
    return this.get<TorrentInfo[]>("/api/v2/torrents/info", qs);
  }

  async properties(hash: string): Promise<TorrentProperties> {
    return this.get<TorrentProperties>("/api/v2/torrents/properties", { hash });
  }

  async files(hash: string): Promise<TorrentFile[]> {
    return this.get<TorrentFile[]>("/api/v2/torrents/files", { hash });
  }

  async trackers(hash: string): Promise<TorrentTracker[]> {
    return this.get<TorrentTracker[]>("/api/v2/torrents/trackers", { hash });
  }

  async pieceStates(hash: string): Promise<number[]> {
    return this.get<number[]>("/api/v2/torrents/pieceStates", { hash });
  }

  async add(params: AddTorrentParams): Promise<void> {
    const form = new FormData();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (key === "torrents") {
        // Support both Blob (Node/web) and {uri, type, name} (React Native)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.append("torrents", value as any, "torrent");
      } else {
        form.append(key, String(value));
      }
    }
    const result = await this.post<string>("/api/v2/torrents/add", form);
    if (result === "Fails.") {
      throw new QBittorrentError("Failed to add torrent");
    }
  }

  async delete(hashes: string[], deleteFiles = false): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("deleteFiles", String(deleteFiles));
    await this.post("/api/v2/torrents/delete", body);
  }

  async start(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/start", body);
  }

  async stop(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/stop", body);
  }

  async recheck(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/recheck", body);
  }

  async reannounce(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/reannounce", body);
  }

  async setDownloadLimit(hashes: string[], limit: number): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("limit", String(limit));
    await this.post("/api/v2/torrents/setDownloadLimit", body);
  }

  async setUploadLimit(hashes: string[], limit: number): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("limit", String(limit));
    await this.post("/api/v2/torrents/setUploadLimit", body);
  }

  async setShareLimits(
    hashes: string[],
    ratioLimit: number,
    seedingTimeLimit: number,
    inactiveSeedingTimeLimit: number,
  ): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("ratioLimit", String(ratioLimit));
    body.set("seedingTimeLimit", String(seedingTimeLimit));
    body.set("inactiveSeedingTimeLimit", String(inactiveSeedingTimeLimit));
    await this.post("/api/v2/torrents/setShareLimits", body);
  }

  async setLocation(hashes: string[], location: string): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("location", location);
    await this.post("/api/v2/torrents/setLocation", body);
  }

  async rename(hash: string, name: string): Promise<void> {
    const body = new URLSearchParams();
    body.set("hash", hash);
    body.set("name", name);
    await this.post("/api/v2/torrents/rename", body);
  }

  async filePrio(hash: string, fileIds: number[], priority: number): Promise<void> {
    const body = new URLSearchParams();
    body.set("hash", hash);
    body.set("id", fileIds.join("|"));
    body.set("priority", String(priority));
    await this.post("/api/v2/torrents/filePrio", body);
  }

  async topPrio(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/topPrio", body);
  }

  async increasePrio(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/increasePrio", body);
  }

  async decreasePrio(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/decreasePrio", body);
  }

  async bottomPrio(hashes: string[]): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    await this.post("/api/v2/torrents/bottomPrio", body);
  }

  async setForceStart(hashes: string[], value: boolean): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("value", String(value));
    await this.post("/api/v2/torrents/setForceStart", body);
  }

  // Peers

  async torrentPeers(hash: string, rid?: number): Promise<TorrentPeersResponse> {
    const params: Record<string, string> = { hash };
    if (rid !== undefined) params.rid = String(rid);
    return this.get<TorrentPeersResponse>("/api/v2/sync/torrentPeers", params);
  }

  // Transfer

  async transferInfo(): Promise<TransferInfo> {
    return this.get<TransferInfo>("/api/v2/transfer/info");
  }

  async speedLimitsMode(): Promise<number> {
    const result = await this.get<string>("/api/v2/transfer/speedLimitsMode");
    return Number(result);
  }

  async toggleSpeedLimitsMode(): Promise<void> {
    await this.post("/api/v2/transfer/toggleSpeedLimitsMode");
  }

  async setGlobalDownloadLimit(limit: number): Promise<void> {
    const body = new URLSearchParams();
    body.set("limit", String(limit));
    await this.post("/api/v2/transfer/setDownloadLimit", body);
  }

  async setGlobalUploadLimit(limit: number): Promise<void> {
    const body = new URLSearchParams();
    body.set("limit", String(limit));
    await this.post("/api/v2/transfer/setUploadLimit", body);
  }

  // App

  async version(): Promise<string> {
    return this.get<string>("/api/v2/app/version");
  }

  async webapiVersion(): Promise<string> {
    return this.get<string>("/api/v2/app/webapiVersion");
  }

  async preferences(): Promise<Preferences> {
    return this.get<Preferences>("/api/v2/app/preferences");
  }

  async setPreferences(prefs: Partial<Preferences>): Promise<void> {
    const body = new URLSearchParams();
    body.set("json", JSON.stringify(prefs));
    await this.post("/api/v2/app/setPreferences", body);
  }

  async defaultSavePath(): Promise<string> {
    return this.get<string>("/api/v2/app/defaultSavePath");
  }

  async shutdown(): Promise<void> {
    await this.post("/api/v2/app/shutdown");
  }
}
