import { describe, expect, it } from "vitest";

import { ServerSchema } from "./server-schema";

const server = {
  id: "server",
  name: "Transmission",
  url: "http://remote.example.com/transmission/rpc",
  type: "transmission" as const,
  createdAt: 1,
  updatedAt: 1,
};

describe("ServerSchema", () => {
  it("migrates the legacy fallback address", () => {
    const parsed = ServerSchema.parse({
      ...server,
      fallbackUrl: "http://192.168.1.10:9091/transmission/rpc",
    });

    expect(parsed.alternativeUrls).toEqual([
      "http://192.168.1.10:9091/transmission/rpc",
    ]);
    expect(parsed).not.toHaveProperty("fallbackUrl");
  });

  it("removes duplicate connection addresses", () => {
    const parsed = ServerSchema.parse({
      ...server,
      alternativeUrls: [
        "http://remote.example.com/transmission/rpc/",
        "http://192.168.1.10:9091/transmission/rpc",
        "http://192.168.1.10:9091/transmission/rpc/",
      ],
    });

    expect(parsed.alternativeUrls).toEqual([
      "http://192.168.1.10:9091/transmission/rpc",
    ]);
  });
});
