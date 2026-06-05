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
  TorrentFileInput,
} from "./types";
import { HTTPError, QBittorrentError } from "./error";

type MultipartFile = { bytes: Uint8Array; filename: string };
type MultipartBody = { bytes: Uint8Array<ArrayBuffer>; contentType: string };

// Built by hand because no FormData implementation works across every
// runtime we target: Expo's fetch rejects React Native's uri-based file
// parts, and React Native's FormData can't carry raw bytes.
function buildMultipart(
  fields: Record<string, string>,
  file: MultipartFile | undefined,
): MultipartBody {
  const boundary =
    "----qbittorrent-client-" + Math.random().toString(36).slice(2);
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];

  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
    );
  }
  if (file) {
    parts.push(
      encoder.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="torrents"; filename="${file.filename}"\r\nContent-Type: application/x-bittorrent\r\n\r\n`,
      ),
    );
    parts.push(file.bytes);
    parts.push(encoder.encode("\r\n"));
  }
  parts.push(encoder.encode(`--${boundary}--\r\n`));

  const bytes = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let offset = 0;
  for (const part of parts) {
    bytes.set(part, offset);
    offset += part.byteLength;
  }

  return { bytes, contentType: `multipart/form-data; boundary=${boundary}` };
}

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
      credentials: "omit",
      body: body.toString(),
    });

    // Wrong credentials: <5.2.0 replies 200 "Fails."; >=5.2.0 replies 401.
    if (response.status === 401) {
      throw new QBittorrentError("Login failed: invalid credentials");
    }

    if (!response.ok) {
      const body = await response.text();
      throw new HTTPError(response.status, response.statusText, body);
    }

    // Success: <5.2.0 replies 200 "Ok."; >=5.2.0 replies 204 with an empty body.
    const text = await response.text();
    if (text.trim() === "Fails.") {
      throw new QBittorrentError("Login failed: invalid credentials");
    }

    const cookie = response.headers.get("set-cookie");
    if (cookie) {
      // qBittorrent <5.2.0 names the session cookie "SID"; >=5.2.0 uses "QBT_SID_<port>".
      const match = cookie.match(/(QBT_SID(?:_\d+)?|SID)=([^;]+)/);
      if (match) {
        this.sid = `${match[1]}=${match[2]}`;
      }
    }

    this.loggedIn = true;
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>("GET", path, params);
  }

  private async post<T = void>(path: string, body?: URLSearchParams | MultipartBody): Promise<T> {
    return this.request<T>("POST", path, undefined, body);
  }

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: URLSearchParams | MultipartBody,
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
      headers["Cookie"] = this.sid;
    }

    // URLSearchParams is not a valid fetch body type in React Native
    let fetchBody: string | Uint8Array<ArrayBuffer> | undefined;
    if (body instanceof URLSearchParams) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      fetchBody = body.toString();
    } else if (body) {
      headers["Content-Type"] = body.contentType;
      fetchBody = body.bytes;
    }

    const response = await fetch(url, { method, headers, body: fetchBody, credentials: "omit" });

    if (response.status === 403 && retry) {
      this.sid = null;
      this.loggedIn = false;
      return this.request<T>(method, path, params, body, false);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new HTTPError(response.status, response.statusText, body);
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
    const fields: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || key === "torrents") continue;
      fields[key] = String(value);
    }

    let file: MultipartFile | undefined;
    const torrents = params.torrents;
    if (torrents) {
      if (typeof Blob !== "undefined" && torrents instanceof Blob) {
        file = {
          bytes: new Uint8Array(await torrents.arrayBuffer()),
          filename: "upload.torrent",
        };
      } else {
        // The `typeof Blob` guard above keeps TypeScript from narrowing the union
        const input = torrents as Exclude<TorrentFileInput, Blob>;
        file = {
          bytes: input.bytes,
          filename: input.filename ?? "upload.torrent",
        };
      }
    }

    const result = await this.post<string>(
      "/api/v2/torrents/add",
      buildMultipart(fields, file),
    );
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
    shareLimitAction = -1,
  ): Promise<void> {
    const body = new URLSearchParams();
    body.set("hashes", this.hashes(hashes));
    body.set("ratioLimit", String(ratioLimit));
    body.set("seedingTimeLimit", String(seedingTimeLimit));
    body.set("inactiveSeedingTimeLimit", String(inactiveSeedingTimeLimit));
    // Required since qBittorrent 5.2.0; -1 = keep the global action. Ignored by older versions.
    body.set("shareLimitAction", String(shareLimitAction));
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

  async renameFile(hash: string, oldPath: string, newPath: string): Promise<void> {
    const body = new URLSearchParams();
    body.set("hash", hash);
    body.set("oldPath", oldPath);
    body.set("newPath", newPath);
    await this.post("/api/v2/torrents/renameFile", body);
  }

  async renameFolder(hash: string, oldPath: string, newPath: string): Promise<void> {
    const body = new URLSearchParams();
    body.set("hash", hash);
    body.set("oldPath", oldPath);
    body.set("newPath", newPath);
    await this.post("/api/v2/torrents/renameFolder", body);
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
