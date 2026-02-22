import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransmissionClient } from "../src/client";
import { HTTPError } from "../src/error";

const URL = "http://localhost:9091/transmission/rpc";

type FetchInput = RequestInfo | URL;

function successSessionStats() {
  return new Response(
    JSON.stringify({
      result: "success",
      arguments: {
        activeTorrentCount: 0,
        downloadSpeed: 0,
        pausedTorrentCount: 0,
        torrentCount: 0,
        uploadSpeed: 0,
        "cumulative-stats": {
          uploadedBytes: 0,
          downloadedBytes: 0,
          filesAdded: 0,
          sessionCount: 0,
          secondsActive: 0,
        },
        "current-stats": {
          uploadedBytes: 0,
          downloadedBytes: 0,
          filesAdded: 0,
          sessionCount: 0,
          secondsActive: 0,
        },
      },
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    }
  );
}

function conflict(sessionId?: string) {
  const headers = new Headers();
  if (sessionId) headers.set("x-transmission-session-id", sessionId);
  return new Response("", { status: 409, headers });
}

describe("TransmissionClient session negotiation", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("shares one bootstrap session request across concurrent calls", async () => {
    let bootstrapCalls = 0;
    const rpcSessionIds: string[] = [];

    global.fetch = vi.fn(async (input: FetchInput) => {
      const request = input as Request;
      const sessionId = request.headers.get("x-transmission-session-id");
      const body = JSON.parse(await request.clone().text()) as {
        method?: string;
      };

      if (!sessionId) {
        bootstrapCalls += 1;
        expect(body.method).toBe("session-stats");
        return conflict("sid-1");
      }

      rpcSessionIds.push(sessionId);
      return successSessionStats();
    }) as typeof global.fetch;

    const client = new TransmissionClient({ url: URL });
    const p1 = client.request({ method: "session-stats" });
    const p2 = client.request({ method: "session-stats" });

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1.result).toBe("success");
    expect(r2.result).toBe("success");
    expect(bootstrapCalls).toBe(1);
    expect(rpcSessionIds).toEqual(["sid-1", "sid-1"]);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("throws when a 409 response does not provide session id", async () => {
    global.fetch = vi.fn(async () => conflict()) as typeof global.fetch;

    const client = new TransmissionClient({ url: URL });
    await expect(client.request({ method: "session-stats" })).rejects.toMatchObject({
      status: 409,
      message: "Missing x-transmission-session-id header",
    });
  });

  it("renegotiates session and retries once when request gets stale 409", async () => {
    let calls = 0;
    const usedSessionIds: string[] = [];

    global.fetch = vi.fn(async (input: FetchInput) => {
      calls += 1;
      const request = input as Request;
      const sessionId = request.headers.get("x-transmission-session-id");

      if (!sessionId) {
        if (calls === 1) return conflict("sid-1");
        return conflict("sid-2");
      }

      usedSessionIds.push(sessionId);
      if (sessionId === "sid-1") return conflict("sid-2");
      return successSessionStats();
    }) as typeof global.fetch;

    const client = new TransmissionClient({ url: URL });
    const response = await client.request({ method: "session-stats" });

    expect(response.result).toBe("success");
    expect(calls).toBe(4);
    expect(usedSessionIds).toEqual(["sid-1", "sid-2"]);
  });

  it("throws HTTPError after retry when request still gets 409", async () => {
    let calls = 0;
    global.fetch = vi.fn(async (input: FetchInput) => {
      calls += 1;
      const request = input as Request;
      const sessionId = request.headers.get("x-transmission-session-id");

      if (!sessionId) {
        if (calls === 1) return conflict("sid-1");
        return conflict("sid-2");
      }

      return conflict("sid-3");
    }) as typeof global.fetch;

    const client = new TransmissionClient({ url: URL });
    const request = client.request({ method: "session-stats" });

    await expect(request).rejects.toBeInstanceOf(HTTPError);
    await expect(request).rejects.toMatchObject({
      status: 409,
    });
    expect(calls).toBe(4);
  });
});
