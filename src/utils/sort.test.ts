import { describe, expect, it } from "vitest";

import compare from "./sort";

function torrent(id: number | string, name: string) {
  return {
    id,
    name,
    queuePosition: 0,
    activityDate: 0,
    addedDate: 0,
    percentDone: 0,
    totalSize: 0,
    status: 0,
    leftUntilDone: 0,
    sizeWhenDone: 1,
    eta: 0,
    uploadRatio: 0,
  } as const;
}

describe("sort comparator", () => {
  it("sorts numeric torrent ids numerically for tie-breakers", () => {
    const items = [
      torrent(10, "same"),
      torrent(2, "same"),
      torrent(1, "same"),
    ];

    items.sort(compare("asc", "name"));

    expect(items.map((t) => t.id)).toEqual([1, 2, 10]);
  });

  it("keeps string torrent ids in lexical order", () => {
    const items = [
      torrent("a10", "same"),
      torrent("a2", "same"),
      torrent("a1", "same"),
    ];

    items.sort(compare("asc", "name"));

    expect(items.map((t) => t.id)).toEqual(["a1", "a10", "a2"]);
  });

  it("sorts numeric torrent ids correctly in descending direction", () => {
    const items = [
      torrent(1, "same"),
      torrent(10, "same"),
      torrent(2, "same"),
    ];

    items.sort(compare("desc", "name"));

    expect(items.map((t) => t.id)).toEqual([10, 2, 1]);
  });
});
