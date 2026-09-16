import { describe, expect, it, vi } from "vitest";

import { QBittorrentAdapter } from "./qbittorrent";
import { TransmissionAdapter } from "./transmission";

function injectClient(adapter: object, client: object): void {
  Object.assign(adapter, { client });
}

describe("free space adapters", () => {
  it("queries arbitrary Transmission paths", async () => {
    const request = vi.fn().mockResolvedValue({
      arguments: { path: "/downloads/archive", "size-bytes": 1_024 },
    });
    const adapter = new TransmissionAdapter({ url: "http://localhost" });
    injectClient(adapter, { request });

    await expect(adapter.getFreeSpace("/downloads/archive")).resolves.toBe(
      1_024,
    );
    expect(request).toHaveBeenCalledWith({
      method: "free-space",
      arguments: { path: "/downloads/archive" },
    });
  });

  it("returns qBittorrent space for the default path", async () => {
    const mainData = vi.fn().mockResolvedValue({
      server_state: { free_space_on_disk: 2_048 },
    });
    const adapter = new QBittorrentAdapter({ url: "http://localhost" });
    injectClient(adapter, { mainData });

    await expect(adapter.getFreeSpace()).resolves.toBe(2_048);
    expect(mainData).toHaveBeenCalledOnce();
  });

  it.each([undefined, -1, Number.POSITIVE_INFINITY])(
    "rejects invalid free-space values: %s",
    async (value) => {
      const adapter = new QBittorrentAdapter({ url: "http://localhost" });
      injectClient(adapter, {
        mainData: vi.fn().mockResolvedValue({
          server_state: { free_space_on_disk: value },
        }),
      });

      await expect(
        adapter.getFreeSpace(),
      ).resolves.toBeUndefined();
    },
  );

  it("accepts zero free bytes", async () => {
    const adapter = new QBittorrentAdapter({ url: "http://localhost" });
    injectClient(adapter, {
      mainData: vi.fn().mockResolvedValue({
        server_state: { free_space_on_disk: 0 },
      }),
    });

    await expect(adapter.getFreeSpace()).resolves.toBe(0);
  });
});
