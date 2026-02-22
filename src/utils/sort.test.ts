import { describe, expect, it } from "vitest";
import type { Torrent } from "~/client";

import compare from "./sort";

function torrent(id: number | string, name: string): Torrent {
  return {
    id,
    name,
    status: 0,
    percentDone: 0,
    rateDownload: 0,
    rateUpload: 0,
    totalSize: 0,
    sizeWhenDone: 1,
    leftUntilDone: 0,
    eta: 0,
    error: 0,
    errorString: "",
    isFinished: false,
    peersConnected: 0,
    peersGettingFromUs: 0,
    peersSendingToUs: 0,
    webseedsSendingToUs: 0,
    uploadedEver: 0,
    uploadRatio: 0,
    recheckProgress: 0,
    queuePosition: 0,
    addedDate: 0,
    doneDate: 0,
    activityDate: 0,
    magnetLink: "",
    downloadDir: "",
  };
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
