import { encode } from "base-64";

import type { TransmissionConfig } from "./config";
import type { AnyRequest, ResponseForRequest } from "./rpc-call";
import { HTTPError, TransmissionError, ResponseParseError } from "./error";

export class TransmissionClient {
  private session: string | null = null;
  private sessionPromise: Promise<void> | null = null;

  constructor(private config: TransmissionConfig) {}

  private authHeader(): string | null {
    if (!this.config.username && !this.config.password) return null;
    const creds = `${this.config.username ?? ""}:${this.config.password ?? ""}`;
    return `Basic ${encode(creds)}`;
  }

  private async ensureSession(): Promise<void> {
    if (this.session) return;
    if (this.sessionPromise) return await this.sessionPromise;

    this.sessionPromise = this.fetchSession();
    try {
      await this.sessionPromise;
    } finally {
      this.sessionPromise = null;
    }
  }

  private async fetchSession(): Promise<void> {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    const auth = this.authHeader();
    if (auth) headers.set("Authorization", auth);

    const response = await fetch(
      new Request(this.config.url, {
        method: "POST",
        headers,
        body: JSON.stringify({ method: "session-stats" }),
      })
    );

    if (response.status !== 409) {
      const body = await response.text();
      if (!response.ok) {
        throw new HTTPError(response.status, response.statusText, body);
      }

      throw new HTTPError(
        response.status,
        "Expected Transmission session negotiation response",
        body
      );
    }

    const nextSession = response.headers.get("x-transmission-session-id");
    if (!nextSession) {
      throw new HTTPError(409, "Missing x-transmission-session-id header");
    }
    this.session = nextSession;
  }

  async request<Req extends AnyRequest>(
    req: Req,
    retry = true
  ): Promise<ResponseForRequest<Req>> {
    await this.ensureSession();

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    headers.set("x-transmission-session-id", this.session!);

    const auth = this.authHeader();
    if (auth) headers.set("Authorization", auth);

    const request: Request = new Request(this.config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    });

    const response: Response = await fetch(request);

    if (response.status === 409 && retry) {
      this.session = null;
      await this.ensureSession();
      return await this.request(req, false);
    }

    if (!response.ok) {
      const body = await response.text();
      throw new HTTPError(response.status, response.statusText, body);
    }

    const text = await response.text();

    let json: ResponseForRequest<Req>;
    try {
      json = JSON.parse(text);
    } catch {
      throw new ResponseParseError(response.status, text);
    }

    if (json && json.result !== "success") {
      throw new TransmissionError(json.result);
    }

    return json;
  }
}
