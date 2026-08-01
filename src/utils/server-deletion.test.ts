import { describe, expect, it } from "vitest";

import type { Server } from "~/store/servers";
import { removeServersById } from "./server-deletion";

function server(id: string, type: Server["type"] = "transmission"): Server {
  return {
    id,
    name: id,
    type,
    url: type === "local" ? "local://engine" : `http://${id}`,
    alternativeUrls: [],
    createdAt: 1,
    updatedAt: 1,
  };
}

const transmission = server("transmission");
const qbittorrent = server("qbittorrent", "qbittorrent");
const local = server("local", "local");

describe("removeServersById", () => {
  it("removes a mixed selection in one update", () => {
    const result = removeServersById(
      {
        servers: [transmission, qbittorrent, local],
        activeServerId: transmission.id,
      },
      new Set([transmission.id, qbittorrent.id, local.id]),
    );

    expect(result).toEqual({ servers: [], activeServerId: undefined });
  });

  it("selects the first remaining server when the active one is removed", () => {
    const result = removeServersById(
      {
        servers: [transmission, qbittorrent, local],
        activeServerId: transmission.id,
      },
      new Set([transmission.id, local.id]),
    );

    expect(result).toEqual({
      servers: [qbittorrent],
      activeServerId: qbittorrent.id,
    });
  });
});
