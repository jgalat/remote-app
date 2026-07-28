import { afterEach, describe, expect, it, vi } from "vitest";

import { QBittorrentClient } from "../src/client";
import { RequestTimeoutError } from "../src/error";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("QBittorrentClient timeout", () => {
  it("aborts login after the configured timeout", async () => {
    global.fetch = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    ) as typeof global.fetch;

    const client = new QBittorrentClient({
      url: "http://localhost:8080",
      requestTimeoutMs: 5,
    });

    await expect(client.version()).rejects.toBeInstanceOf(RequestTimeoutError);
  });
});
