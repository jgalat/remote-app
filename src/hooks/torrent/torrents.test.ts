import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToastAndroid } from "react-native";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import type { MutationObserverOptions } from "@tanstack/react-query";
import type { RenamePathParams, SetLocationParams } from "~/client";
import { useClient } from "./client";
import { useRenamePath, useTorrentSetLocation } from "./torrents";

const { clear, renamePath, setLocation } = vi.hoisted(() => ({
  clear: vi.fn(),
  renamePath: vi.fn(),
  setLocation: vi.fn(),
}));

vi.mock("react-native", () => ({ ToastAndroid: { show: vi.fn(), LONG: 1 } }));
vi.mock("./client", () => ({ useClient: vi.fn() }));
vi.mock("~/hooks/use-settings", () => ({ useServer: () => undefined }));
vi.mock("~/hooks/use-torrent-selection", () => ({
  default: () => ({ clear }),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useMutation: (options: unknown) => options,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(useClient).mockReturnValue({
    renamePath,
    setLocation,
  } as unknown as ReturnType<typeof useClient>);
});

function observe<T>(options: unknown) {
  return new MutationObserver(
    new QueryClient(),
    options as MutationObserverOptions<void, Error, T>,
  );
}

describe("move and rename mutations", () => {
  it("remains pending until rename resolves", async () => {
    let resolve!: () => void;
    renamePath.mockReturnValue(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const mutation = observe<RenamePathParams>(useRenamePath());
    const params: RenamePathParams = {
      id: 1,
      path: "old",
      name: "new",
      kind: "torrent",
    };
    const result = mutation.mutate(params);
    await vi.waitFor(() => expect(renamePath).toHaveBeenCalledWith(params));
    expect(mutation.getCurrentResult().isPending).toBe(true);
    resolve();
    await result;
    expect(mutation.getCurrentResult().isSuccess).toBe(true);
    expect(ToastAndroid.show).not.toHaveBeenCalled();
  });

  it("retains selection after move failure and clears it after a successful retry", async () => {
    setLocation.mockRejectedValueOnce(new Error("Permission denied"));
    const mutation = observe<SetLocationParams>(useTorrentSetLocation());
    const params = { ids: [1], location: "/downloads/new", move: true };
    await expect(mutation.mutate(params)).rejects.toThrow("Permission denied");
    expect(mutation.getCurrentResult().isError).toBe(true);
    expect(clear).not.toHaveBeenCalled();
    expect(ToastAndroid.show).toHaveBeenCalledExactlyOnceWith(
      "Failed to move torrent: Permission denied",
      ToastAndroid.LONG,
    );
    await mutation.mutate(params);
    expect(clear).toHaveBeenCalledOnce();
    expect(mutation.getCurrentResult().isSuccess).toBe(true);
  });

  it("reports rename errors once", async () => {
    renamePath.mockRejectedValueOnce(new Error("Request timed out"));
    const mutation = observe<RenamePathParams>(useRenamePath());
    await expect(
      mutation.mutate({ id: 1, path: "old", name: "new", kind: "torrent" }),
    ).rejects.toThrow("Request timed out");
    expect(ToastAndroid.show).toHaveBeenCalledExactlyOnceWith(
      "Failed to rename: Request timed out",
      ToastAndroid.LONG,
    );
  });

  it("rejects both operations when the client is unavailable", async () => {
    vi.mocked(useClient).mockReturnValue(null);
    await expect(
      observe<RenamePathParams>(useRenamePath()).mutate({
        id: 1,
        path: "old",
        name: "new",
        kind: "torrent",
      }),
    ).rejects.toThrow("No server selected");
    await expect(
      observe<SetLocationParams>(useTorrentSetLocation()).mutate({
        ids: [1],
        location: "/downloads/new",
        move: true,
      }),
    ).rejects.toThrow("No server selected");
    expect(clear).not.toHaveBeenCalled();
  });
});
