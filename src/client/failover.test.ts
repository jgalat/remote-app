import { describe, expect, it, vi } from "vitest";

import type { TorrentClient } from "./interface";
import { createFailoverClient } from "./failover";

function client(ping: () => Promise<void>): TorrentClient {
  return { ping } as TorrentClient;
}

describe("createFailoverClient", () => {
  it("tries addresses in order and keeps using the successful address", async () => {
    const primaryPing = vi.fn().mockRejectedValue(new TypeError("offline"));
    const firstAlternativePing = vi
      .fn()
      .mockRejectedValue(new TypeError("offline"));
    const secondAlternativePing = vi.fn().mockResolvedValue(undefined);
    const failover = createFailoverClient([
      client(primaryPing),
      client(firstAlternativePing),
      client(secondAlternativePing),
    ]);

    await failover.ping();
    await failover.ping();

    expect(primaryPing).toHaveBeenCalledTimes(1);
    expect(firstAlternativePing).toHaveBeenCalledTimes(1);
    expect(secondAlternativePing).toHaveBeenCalledTimes(2);
  });

  it("cycles back through the list when the active address fails", async () => {
    const primaryPing = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValue(undefined);
    const alternativePing = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new TypeError("offline"));
    const failover = createFailoverClient([
      client(primaryPing),
      client(alternativePing),
    ]);

    await failover.ping();
    await failover.ping();

    expect(primaryPing).toHaveBeenCalledTimes(2);
    expect(alternativePing).toHaveBeenCalledTimes(2);
  });

  it("does not retry authentication failures", async () => {
    const unauthorized = Object.assign(new Error("Unauthorized"), {
      status: 401,
    });
    const primaryPing = vi.fn().mockRejectedValue(unauthorized);
    const alternativePing = vi.fn().mockResolvedValue(undefined);
    const failover = createFailoverClient([
      client(primaryPing),
      client(alternativePing),
    ]);

    await expect(failover.ping()).rejects.toBe(unauthorized);
    expect(alternativePing).not.toHaveBeenCalled();
  });
});
