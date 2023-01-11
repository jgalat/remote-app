import { encode } from "base-64";

import type { TransmissionConfig } from "./config";
import type { Methods, Calls } from "./rpc-call";
import { HTTPError, TransmissionError } from "./error";

export class TransmissionClient {
  private session: string | null = null;

  constructor(private config: TransmissionConfig) {}

  async request<M extends Methods>(
    req: Parameters<Calls[M]>[0] & { method: M }
  ): Promise<ReturnType<Calls[M]>> {
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    if (this.session) {
      headers.set("x-transmission-session-id", this.session);
    }

    if (this.config.username || this.config.password) {
      const creds = `${this.config.username ?? ""}:${
        this.config.password ?? ""
      }`;
      headers.set("Authorization", `Basic ${encode(creds)}`);
    }

    const request: Request = new Request(this.config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    });

    const response: Response = await fetch(request);

    if (response.status === 409) {
      this.session = response.headers.get("x-transmission-session-id");
      return await this.request<M>(req);
    }

    if (!response.ok) {
      throw new HTTPError(response.status, response.statusText);
    }

    const json = (await response.json()) as ReturnType<Calls[M]>;
    if (json && json.result !== "success") {
      throw new TransmissionError(json.result);
    }

    return json;
  }
}
