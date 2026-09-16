import { describe, expect, it, vi } from "vitest";

import type { TorrentClient } from "./interface";
import { createFailoverClient } from "./failover";

function client(ping: () => Promise<void>): TorrentClient {
  return { ping } as TorrentClient;
}

function networkError(): Error {
  return Object.assign(new Error("offline"), { name: "NetworkError" });
}

describe("createFailoverClient", () => {
  it("tries addresses in order and keeps using the successful address", async () => {
    const primaryPing = vi.fn().mockRejectedValue(networkError());
    const firstAlternativePing = vi
      .fn()
      .mockRejectedValue(networkError());
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
      .mockRejectedValueOnce(networkError())
      .mockResolvedValue(undefined);
    const alternativePing = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(networkError());
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

  it("does not replay mutations after an ambiguous timeout", async () => {
    const timeout = Object.assign(new Error("Timed out"), {
      name: "RequestTimeoutError",
    });
    const primaryMove = vi.fn().mockRejectedValue(timeout);
    const alternativeMove = vi.fn().mockResolvedValue(undefined);
    const failover = createFailoverClient([
      { queueMoveUp: primaryMove } as unknown as TorrentClient,
      { queueMoveUp: alternativeMove } as unknown as TorrentClient,
    ]);

    await expect(failover.queueMoveUp([1])).rejects.toBe(timeout);
    expect(primaryMove).toHaveBeenCalledTimes(1);
    expect(alternativeMove).not.toHaveBeenCalled();
  });

  it("runs mutations on the address selected by a successful read", async () => {
    const primaryPing = vi.fn().mockRejectedValue(networkError());
    const alternativePing = vi.fn().mockResolvedValue(undefined);
    const primaryMove = vi.fn().mockResolvedValue(undefined);
    const alternativeMove = vi.fn().mockResolvedValue(undefined);
    const failover = createFailoverClient([
      {
        ping: primaryPing,
        queueMoveUp: primaryMove,
      } as unknown as TorrentClient,
      {
        ping: alternativePing,
        queueMoveUp: alternativeMove,
      } as unknown as TorrentClient,
    ]);

    await failover.ping();
    await failover.queueMoveUp([1]);

    expect(primaryMove).not.toHaveBeenCalled();
    expect(alternativeMove).toHaveBeenCalledTimes(1);
  });

  it("retries free-space reads on alternative addresses", async () => {
    const primaryFreeSpace = vi.fn().mockRejectedValue(networkError());
    const alternativeFreeSpace = vi.fn().mockResolvedValue(1_024);
    const failover = createFailoverClient([
      { getFreeSpace: primaryFreeSpace } as unknown as TorrentClient,
      { getFreeSpace: alternativeFreeSpace } as unknown as TorrentClient,
    ]);

    await expect(failover.getFreeSpace?.("/downloads")).resolves.toBe(1_024);
    expect(primaryFreeSpace).toHaveBeenCalledOnce();
    expect(alternativeFreeSpace).toHaveBeenCalledOnce();
  });
});
