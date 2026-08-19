import { describe, expect, it } from "vitest";

import { formatAvailableSpace } from "./free-space";

describe("formatAvailableSpace", () => {
  it("formats empty and gigabyte-sized disks", () => {
    expect(formatAvailableSpace(0)).toBe("0.00 kB available");
    expect(formatAvailableSpace(1_024 ** 3)).toBe("1.00 GB available");
  });
});
