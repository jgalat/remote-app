import { describe, expect, it } from "vitest";
import { compareFileEntries } from "./file";

describe("file browser sorting", () => {
  it("orders folders before files, then sorts names within each group", () => {
    const entries = [
      { name: "z.txt", isFile: true },
      { name: "z-folder", isFile: false },
      { name: "a.txt", isFile: true },
      { name: "a-folder", isFile: false },
    ];
    expect(entries.sort(compareFileEntries).map(({ name }) => name)).toEqual([
      "a-folder",
      "z-folder",
      "a.txt",
      "z.txt",
    ]);
  });

  it("handles empty input and equal names", () => {
    expect([].sort(compareFileEntries)).toEqual([]);
    expect(
      compareFileEntries(
        { name: "same", isFile: true },
        { name: "same", isFile: true },
      ),
    ).toBe(0);
  });

  it("sorts a large directory without losing entries", () => {
    const entries = Array.from({ length: 10_000 }, (_, i) => ({
      name: String(10_000 - i).padStart(5, "0"),
      isFile: i % 2 === 0,
    }));
    const sorted = [...entries].sort(compareFileEntries);
    expect(new Set(sorted).size).toBe(entries.length);
    expect(sorted.slice(0, 5_000).every((entry) => !entry.isFile)).toBe(true);
    expect(sorted.slice(5_000).every((entry) => entry.isFile)).toBe(true);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].isFile !== sorted[i].isFile) continue;
      expect(
        sorted[i - 1].name.localeCompare(sorted[i].name),
      ).toBeLessThanOrEqual(0);
    }
  });
});
