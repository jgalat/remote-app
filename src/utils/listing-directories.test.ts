import { describe, expect, it } from "vitest";

import { aggregateListingDirectories } from "./listing-directories";

describe("aggregateListingDirectories", () => {
  it("combines directories from every aggregate source", () => {
    expect(
      aggregateListingDirectories(
        ["/transmission", "/qbittorrent"],
        ["/saved", "/transmission"],
        ["/local/private", "/qbittorrent"],
      ),
    ).toEqual([
      "/transmission",
      "/qbittorrent",
      "/saved",
      "/local/private",
    ]);
  });

  it("ignores empty directories", () => {
    expect(aggregateListingDirectories([undefined, ""], [], [])).toEqual([]);
  });
});
