import { encode } from "base-64";

import type { TransmissionConfig } from "./config";
import type { Methods, Mapping } from "./rpc-call";
import { HTTPError, TransmissionError } from "./error";

export class TransmissionClient {
  private session: string | null = null;

  constructor(private config: TransmissionConfig) {}

  async request<M extends Methods>(
    body: Mapping[M][0] & { method: M }
  ): Promise<Mapping[M][1]> {
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
      body: JSON.stringify(body),
    });

    const response: Response = await fetch(request);

    if (response.status === 409) {
      this.session = response.headers.get("x-transmission-session-id");
      return await this.request<M>(body);
    }

    if (response.status >= 400) {
      throw new HTTPError(response.status, response.statusText);
    }

    const json = (await response.json()) as Mapping[M][1];
    if (json && json.result !== "success") {
      throw new TransmissionError(json.result)
    }

    return json;
  }
}
