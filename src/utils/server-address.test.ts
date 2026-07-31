import { describe, expect, it } from "vitest";

import { promoteServerAddress } from "./server-address";

describe("promoteServerAddress", () => {
  it("makes the selected alternative primary and keeps the remaining order", () => {
    expect(
      promoteServerAddress(
        "http://primary",
        ["http://lan", "http://vpn", "http://public"],
        1,
      ),
    ).toEqual({
      url: "http://vpn",
      alternativeUrls: ["http://primary", "http://lan", "http://public"],
    });
  });

  it("ignores an unknown alternative", () => {
    expect(promoteServerAddress("http://primary", [], 0)).toBeUndefined();
  });
});
