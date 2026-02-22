import { describe, expect, it } from "vitest";

import {
  defaultPortForSSL,
  typeDefaults,
} from "./server-connection-defaults";

describe("server connection defaults", () => {
  it("uses transmission default port when ssl is disabled", () => {
    expect(defaultPortForSSL("transmission", false)).toBe(9091);
  });

  it("uses qbittorrent default port when ssl is disabled", () => {
    expect(defaultPortForSSL("qbittorrent", false)).toBe(8080);
  });

  it("uses standard ssl port when ssl is enabled", () => {
    expect(defaultPortForSSL("transmission", true)).toBe(443);
    expect(defaultPortForSSL("qbittorrent", true)).toBe(443);
  });

  it("keeps default paths per client type", () => {
    expect(typeDefaults.transmission.path).toBe("/transmission/rpc");
    expect(typeDefaults.qbittorrent.path).toBe("");
  });
});
