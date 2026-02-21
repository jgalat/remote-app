import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, expect } from "vitest";
import { QBittorrentClient } from "../src/client";
import { QBittorrentError } from "../src/error";
import {
  TorrentInfoSchema,
  TorrentPropertiesSchema,
  TorrentFileSchema,
  TorrentTrackerSchema,
  TransferInfoSchema,
  PreferencesSchema,
} from "./schemas";

const URL = "http://localhost:8080";
const TORRENT_FILE = resolve(__dirname, "fixtures/test.torrent");
const TORRENT_BYTES = readFileSync(TORRENT_FILE);
const HASH = "c70556f6b4c2b63ca346cc34f33d526935f7cc0e";

async function waitForTorrent(client: QBittorrentClient, hash: string): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const torrents = await client.info({ hashes: hash });
    if (torrents.length > 0) return;
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error("Torrent did not appear");
}

describe("QBittorrentClient", () => {
  const client = new QBittorrentClient({
    url: URL,
    username: "test",
    password: "test",
  });

  describe("app", () => {
    it("version", async () => {
      const version = await client.version();
      expect(version).toMatch(/^v/);
    });

    it("webapiVersion", async () => {
      const version = await client.webapiVersion();
      expect(version).toMatch(/^\d+\.\d+/);
    });

    it("preferences", async () => {
      const prefs = await client.preferences();
      PreferencesSchema.parse(prefs);
    });

    it("setPreferences", async () => {
      await client.setPreferences({ alt_dl_limit: 10_240 });
      const prefs = await client.preferences();
      expect(prefs.alt_dl_limit).toBe(10_240);
    });

    it("defaultSavePath", async () => {
      const path = await client.defaultSavePath();
      expect(typeof path).toBe("string");
      expect(path.length).toBeGreaterThan(0);
    });
  });

  describe("transfer", () => {
    it("transferInfo", async () => {
      const info = await client.transferInfo();
      TransferInfoSchema.parse(info);
    });

    it("speedLimitsMode", async () => {
      const mode = await client.speedLimitsMode();
      expect([0, 1]).toContain(mode);
    });

    it("toggleSpeedLimitsMode", async () => {
      const before = await client.speedLimitsMode();
      await client.toggleSpeedLimitsMode();
      const after = await client.speedLimitsMode();
      expect(after).toBe(before === 0 ? 1 : 0);
      await client.toggleSpeedLimitsMode();
    });

    it("setGlobalDownloadLimit", async () => {
      await client.setGlobalDownloadLimit(512_000);
      const info = await client.transferInfo();
      expect(info.dl_rate_limit).toBe(512_000);
      await client.setGlobalDownloadLimit(0);
    });

    it("setGlobalUploadLimit", async () => {
      await client.setGlobalUploadLimit(512_000);
      const info = await client.transferInfo();
      expect(info.up_rate_limit).toBe(512_000);
      await client.setGlobalUploadLimit(0);
    });
  });

  describe("torrents", () => {
    it("add", async () => {
      const blob = new Blob([TORRENT_BYTES]);
      await client.add({ torrents: blob, paused: true });
      await waitForTorrent(client, HASH);
      const torrents = await client.info({ hashes: HASH });
      expect(torrents).toHaveLength(1);
      expect(torrents[0].hash).toBe(HASH);
      expect(torrents[0].name).toBe("test-file.txt");
    });

    it("info", async () => {
      const torrents = await client.info();
      expect(torrents.length).toBeGreaterThan(0);
      TorrentInfoSchema.parse(torrents[0]);
    });

    it("info with filter", async () => {
      const torrents = await client.info({ hashes: HASH });
      expect(torrents).toHaveLength(1);
      expect(torrents[0].hash).toBe(HASH);
    });

    it("properties", async () => {
      const props = await client.properties(HASH);
      TorrentPropertiesSchema.parse(props);
    });

    it("files", async () => {
      const files = await client.files(HASH);
      expect(files.length).toBeGreaterThan(0);
      TorrentFileSchema.parse(files[0]);
      expect(files[0].name).toBe("test-file.txt");
    });

    it("trackers", async () => {
      const trackers = await client.trackers(HASH);
      expect(trackers.length).toBeGreaterThan(0);
      TorrentTrackerSchema.parse(trackers[0]);
    });

    it("start / stop", async () => {
      await client.start([HASH]);
      await client.stop([HASH]);
    });

    it("recheck", async () => {
      await client.recheck([HASH]);
    });

    it("reannounce", async () => {
      await client.reannounce([HASH]);
    });

    it("setDownloadLimit / setUploadLimit", async () => {
      await client.setDownloadLimit([HASH], 102_400);
      await client.setUploadLimit([HASH], 51_200);
      const torrents = await client.info({ hashes: HASH });
      expect(torrents[0].dl_limit).toBe(102_400);
      expect(torrents[0].up_limit).toBe(51_200);
    });

    it("setShareLimits", async () => {
      await client.setShareLimits([HASH], 2.0, 60, -1);
    });

    it("setLocation", async () => {
      await client.setLocation([HASH], "/downloads");
    });

    it("rename", async () => {
      const torrents = await client.info({ hashes: HASH });
      const originalName = torrents[0].name;
      await client.rename(HASH, "renamed-torrent");
      const updated = await client.info({ hashes: HASH });
      expect(updated[0].name).toBe("renamed-torrent");
      await client.rename(HASH, originalName);
    });

    it("queue priority", async () => {
      await client.topPrio([HASH]);
      await client.bottomPrio([HASH]);
      await client.increasePrio([HASH]);
      await client.decreasePrio([HASH]);
    });

    it("setForceStart", async () => {
      await client.setForceStart([HASH], true);
      const torrents = await client.info({ hashes: HASH });
      expect(torrents[0].force_start).toBe(true);
      await client.setForceStart([HASH], false);
    });

    it("delete", async () => {
      await client.delete([HASH], true);
      const torrents = await client.info({ hashes: HASH });
      expect(torrents).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("throws on invalid URL", async () => {
      const bad = new QBittorrentClient({ url: "http://localhost:1" });
      await expect(bad.version()).rejects.toThrow();
    });

    it("throws QBittorrentError on wrong auth", async () => {
      const bad = new QBittorrentClient({
        url: URL,
        username: "wrong",
        password: "wrong",
      });
      await expect(bad.version()).rejects.toThrow(QBittorrentError);
    });
  });
});
