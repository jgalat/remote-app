import { describe, expect, it } from "vitest";

import { normalizeServerScope } from "./server-scope";

describe("normalizeServerScope", () => {
  it("uses the active scope when fewer than two servers are available", () => {
    expect(normalizeServerScope("all", 0)).toBe("active");
    expect(normalizeServerScope("all", 1)).toBe("active");
  });

  it("keeps the selected scope when multiple servers are available", () => {
    expect(normalizeServerScope("active", 2)).toBe("active");
    expect(normalizeServerScope("all", 2)).toBe("all");
  });
});
