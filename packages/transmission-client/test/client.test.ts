import { readFileSync } from "fs";
import { resolve } from "path";
import { Socket } from "node:net";
import { describe, it, expect } from "vitest";
import { TransmissionClient } from "../src/client";
import { HTTPError } from "../src/error";
import {
  TorrentSchema,
  SessionGetResponseSchema,
  SessionStatsResponseSchema,
  FreeSpaceResponseSchema,
} from "../src/schemas";

const URL = "http://localhost:9091/transmission/rpc";
const TORRENT_FILE = resolve(__dirname, "fixtures/test.torrent");
const TORRENT_B64 = readFileSync(TORRENT_FILE).toString("base64");
const HASH = "c70556f6b4c2b63ca346cc34f33d526935f7cc0e";

async function isPortOpen(port: number, host = "127.0.0.1", timeoutMs = 500): Promise<boolean> {
  return await new Promise((resolve) => {
    const socket = new Socket();
    const done = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
    socket.connect(port, host);
  });
}

const transmissionAvailable = await isPortOpen(9091);
const describeIfTransmission = transmissionAvailable ? describe : describe.skip;

const TORRENT_FIELDS = [
  "id",
  "name",
  "status",
  "hashString",
  "totalSize",
  "percentDone",
  "rateDownload",
  "rateUpload",
  "uploadedEver",
  "downloadedEver",
  "eta",
  "error",
  "errorString",
  "addedDate",
  "doneDate",
  "downloadDir",
  "isFinished",
  "isStalled",
  "queuePosition",
  "uploadRatio",
  "sizeWhenDone",
  "leftUntilDone",
  "peersConnected",
  "peersSendingToUs",
  "peersGettingFromUs",
  "activityDate",
] as const;

describeIfTransmission("TransmissionClient", () => {
  const client = new TransmissionClient({
    url: URL,
    username: "test",
    password: "test",
  });

  describe("session", () => {
    it("session-get", async () => {
      const response = await client.request({
        method: "session-get",
        arguments: { fields: [] },
      });
      SessionGetResponseSchema.parse(response.arguments);
    });

    it("session-set", async () => {
      const response = await client.request({
        method: "session-set",
        arguments: { "alt-speed-down": 100 },
      });
      expect(response.result).toBe("success");
    });

    it("session-stats", async () => {
      const response = await client.request({ method: "session-stats" });
      SessionStatsResponseSchema.parse(response.arguments);
    });
  });

  describe("torrents", () => {
    let torrentId: number;

    it("torrent-add", async () => {
      const response = await client.request({
        method: "torrent-add",
        arguments: { metainfo: TORRENT_B64, paused: true },
      });
      expect(response.result).toBe("success");
      const args = response.arguments as Record<string, { id?: number; name?: string; hashString?: string }>;
      const added = args["torrent-added"] ?? args["torrent-duplicate"];
      expect(added).toBeDefined();
      expect(added.id).toBeTypeOf("number");
      expect(added.name).toBe("test-file.txt");
      expect(added.hashString).toBe(HASH);
      torrentId = added.id!;
    });

    it("torrent-get", async () => {
      const response = await client.request({
        method: "torrent-get",
        arguments: { ids: [torrentId], fields: [...TORRENT_FIELDS] },
      });
      expect(response.arguments.torrents).toHaveLength(1);
      TorrentSchema.parse(response.arguments.torrents[0]);
    });

    it("torrent-set", async () => {
      const response = await client.request({
        method: "torrent-set",
        arguments: { ids: [torrentId], uploadLimited: true, uploadLimit: 50 },
      });
      expect(response.result).toBe("success");
    });

    it("torrent-start / torrent-stop", async () => {
      let response = await client.request({
        method: "torrent-start",
        arguments: { ids: [torrentId] },
      });
      expect(response.result).toBe("success");

      response = await client.request({
        method: "torrent-stop",
        arguments: { ids: [torrentId] },
      });
      expect(response.result).toBe("success");
    });

    it("torrent-verify", async () => {
      const response = await client.request({
        method: "torrent-verify",
        arguments: { ids: [torrentId] },
      });
      expect(response.result).toBe("success");
    });

    it("torrent-reannounce", async () => {
      const response = await client.request({
        method: "torrent-reannounce",
        arguments: { ids: [torrentId] },
      });
      expect(response.result).toBe("success");
    });

    it("torrent-set-location", async () => {
      const response = await client.request({
        method: "torrent-set-location",
        arguments: { ids: [torrentId], location: "/downloads", move: false },
      });
      expect(response.result).toBe("success");
    });

    it("queue-move-*", async () => {
      for (const method of [
        "queue-move-top",
        "queue-move-up",
        "queue-move-down",
        "queue-move-bottom",
      ] as const) {
        const response = await client.request({
          method,
          arguments: { ids: [torrentId] },
        });
        expect(response.result).toBe("success");
      }
    });

    it("torrent-remove", async () => {
      const response = await client.request({
        method: "torrent-remove",
        arguments: { ids: [torrentId], "delete-local-data": true },
      });
      expect(response.result).toBe("success");

      const check = await client.request({
        method: "torrent-get",
        arguments: { ids: [torrentId], fields: ["id"] },
      });
      expect(check.arguments.torrents).toHaveLength(0);
    });
  });

  describe("free-space", () => {
    it("returns free space", async () => {
      const response = await client.request({
        method: "free-space",
        arguments: { path: "/downloads" },
      });
      FreeSpaceResponseSchema.parse(response.arguments);
    });
  });

  describe("error handling", () => {
    it("throws HTTPError on invalid URL", async () => {
      const bad = new TransmissionClient({ url: "http://localhost:1" });
      await expect(
        bad.request({ method: "session-stats" })
      ).rejects.toThrow();
    });

    it("throws HTTPError on wrong auth", async () => {
      const bad = new TransmissionClient({
        url: URL,
        username: "wrong",
        password: "wrong",
      });
      await expect(
        bad.request({ method: "session-stats" })
      ).rejects.toThrow(HTTPError);
    });
  });
});
