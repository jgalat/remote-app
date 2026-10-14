import { describe, expect, it, vi } from "vitest";

import { QBittorrentAdapter } from "./qbittorrent";
import { TransmissionAdapter } from "./transmission";

function injectClient(adapter: object, client: object): void {
  Object.assign(adapter, { client });
}

describe("port check adapters", () => {
  it("runs Transmission port-test over IPv4", async () => {
    const request = vi.fn(async ({ method }: { method: string }) =>
      method === "session-get"
        ? { arguments: { "peer-port": 51_413 } }
        : { arguments: { "port-is-open": true, ip_protocol: "ipv4" } },
    );
    const adapter = new TransmissionAdapter({ url: "http://localhost" });
    injectClient(adapter, { request });

    await expect(adapter.checkPort()).resolves.toEqual({
      port: 51_413,
      open: true,
    });
    expect(request).toHaveBeenCalledWith({
      method: "session-get",
      arguments: { fields: ["peer-port"] },
    });
    expect(request).toHaveBeenCalledWith({
      method: "port-test",
      arguments: { ip_protocol: "ipv4" },
    });
  });

  it.each([
    ["connected", true],
    ["firewalled", false],
    ["disconnected", false],
  ])("maps qBittorrent %s status", async (status, open) => {
    const adapter = new QBittorrentAdapter({ url: "http://localhost" });
    injectClient(adapter, {
      preferences: vi.fn().mockResolvedValue({ listen_port: 6_881 }),
      transferInfo: vi.fn().mockResolvedValue({ connection_status: status }),
    });

    await expect(adapter.checkPort()).resolves.toEqual({ port: 6_881, open });
  });
});
