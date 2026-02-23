import { describe, expectTypeOf, it } from "vitest";

import type { RequestForMethod, ResponseForRequest } from "../src/rpc-call";
import type { TorrentField } from "../src/rpc-calls/torrent-get";

type TupleTorrentRequest = RequestForMethod<"torrent-get"> & {
  arguments: { fields: readonly ["id", "name"] };
};
type TupleTorrentResponse = ResponseForRequest<TupleTorrentRequest>;

type TupleSessionRequest = RequestForMethod<"session-get"> & {
  arguments: { fields: readonly ["download-dir", "pex-enabled"] };
};
type TupleSessionResponse = ResponseForRequest<TupleSessionRequest>;

type WidenedTorrentRequest = RequestForMethod<"torrent-get"> & {
  arguments: { fields: readonly TorrentField[] };
};
type WidenedTorrentResponse = ResponseForRequest<WidenedTorrentRequest>;

type SubsetArrayTorrentRequest = RequestForMethod<"torrent-get"> & {
  arguments: { fields: readonly ("id" | "name")[] };
};
type SubsetArrayTorrentResponse = ResponseForRequest<SubsetArrayTorrentRequest>;

describe("request typing", () => {
  it("narrows torrent-get response for tuple fields", () => {
    expectTypeOf<TupleTorrentResponse["arguments"]["torrents"][number]["id"]>().toEqualTypeOf<number>();
    expectTypeOf<TupleTorrentResponse["arguments"]["torrents"][number]["name"]>().toEqualTypeOf<string>();

    // @ts-expect-error status is not requested in the tuple field list.
    expectTypeOf<TupleTorrentResponse["arguments"]["torrents"][number]["status"]>();
  });

  it("narrows session-get response for tuple fields", () => {
    expectTypeOf<TupleSessionResponse["arguments"]["download-dir"]>().toEqualTypeOf<string>();
    expectTypeOf<TupleSessionResponse["arguments"]["pex-enabled"]>().toEqualTypeOf<boolean>();

    // @ts-expect-error version is not requested in the tuple field list.
    expectTypeOf<TupleSessionResponse["arguments"]["version"]>();
  });

  it("falls back to broad response for widened field arrays", () => {
    expectTypeOf<WidenedTorrentResponse["arguments"]["torrents"][number]["id"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SubsetArrayTorrentResponse["arguments"]["torrents"][number]["id"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<SubsetArrayTorrentResponse["arguments"]["torrents"][number]["name"]>().toEqualTypeOf<string | undefined>();
  });
});
