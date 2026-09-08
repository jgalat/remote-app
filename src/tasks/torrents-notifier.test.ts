import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import { createClient } from "~/client";
import { loadServers } from "~/store/servers";
import { loadState, storeState } from "~/store/task-torrents-notifier";
import TorrentsNotifierTask from "./torrents-notifier";

vi.mock("expo-background-task", () => ({
  BackgroundTaskResult: { Success: 1 },
}));
vi.mock("expo-network", () => ({ getNetworkStateAsync: vi.fn() }));
vi.mock("expo-notifications", () => ({ scheduleNotificationAsync: vi.fn() }));
vi.mock("~/client", () => ({ createClient: vi.fn() }));
vi.mock("~/store/migrations", () => ({}));
vi.mock("~/store/storage", () => ({ storage: {} }));
vi.mock("~/store/servers", () => ({ loadServers: vi.fn() }));
vi.mock("~/store/task-torrents-notifier", async (importOriginal) => ({
  ...(await importOriginal<typeof import("~/store/task-torrents-notifier")>()),
  loadState: vi.fn(),
  storeState: vi.fn(),
}));
vi.mock("~/utils/mock-transmission-client", () => ({
  isTestingServer: () => false,
}));
vi.mock("@remote-app/pro", () => ({ isLocalEngineAvailable: () => true }));

const remote = {
  id: "remote",
  name: "LAN",
  type: "transmission" as const,
  url: "http://192.168.1.2:9091",
  alternativeUrls: [],
  createdAt: 0,
  updatedAt: 0,
};
const local = { ...remote, id: "local", type: "local" as const };
const getTorrents = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(100_000);
  vi.mocked(loadServers).mockReturnValue({ servers: [remote] });
  vi.mocked(loadState).mockReturnValue({
    servers: { remote: { lastUpdate: 10 } },
  });
  vi.mocked(Network.getNetworkStateAsync).mockResolvedValue({
    isConnected: true,
    isInternetReachable: false,
  });
  vi.mocked(createClient).mockReturnValue({
    getTorrents,
  } as unknown as ReturnType<typeof createClient>);
  getTorrents.mockResolvedValue([{ doneDate: 20 }]);
  vi.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue(
    "notification",
  );
});

afterEach(() => vi.restoreAllMocks());

describe("torrent completion notifications", () => {
  it.each([true, undefined])(
    "checks LAN servers with connectivity %s and no internet",
    async (isConnected) => {
      vi.mocked(Network.getNetworkStateAsync).mockResolvedValue({
        isConnected,
        isInternetReachable: false,
      });
      await TorrentsNotifierTask();
      expect(getTorrents).toHaveBeenCalledOnce();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledOnce();
    },
  );

  it("checks local servers while disconnected and skips remote servers", async () => {
    vi.mocked(loadServers).mockReturnValue({ servers: [remote, local] });
    vi.mocked(Network.getNetworkStateAsync).mockResolvedValue({
      isConnected: false,
    });
    await TorrentsNotifierTask();
    expect(createClient).toHaveBeenCalledExactlyOnceWith(local);
  });

  it("attempts requests if the network lookup fails", async () => {
    vi.mocked(Network.getNetworkStateAsync).mockRejectedValue(
      new Error("Unavailable"),
    );
    await TorrentsNotifierTask();
    expect(getTorrents).toHaveBeenCalledOnce();
  });

  it.each(["creation", "request"])(
    "continues after a server %s failure",
    async (failure) => {
      vi.mocked(loadServers).mockReturnValue({ servers: [remote, local] });
      if (failure === "creation") {
        vi.mocked(createClient).mockImplementationOnce(() => {
          throw new Error("Invalid client");
        });
      } else {
        getTorrents.mockRejectedValueOnce(new Error("Offline"));
      }
      await TorrentsNotifierTask();
      expect(createClient).toHaveBeenCalledWith(local);
      expect(storeState).toHaveBeenCalledWith({
        servers: { remote: { lastUpdate: 10 }, local: { lastUpdate: 100 } },
      });
    },
  );

  it("establishes the first baseline without historical notifications", async () => {
    vi.mocked(loadState).mockReturnValue({ servers: {} });
    await TorrentsNotifierTask();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(storeState).toHaveBeenCalledWith({
      servers: { remote: { lastUpdate: 100 } },
    });
  });

  it("preserves the checkpoint when notification scheduling fails and retries", async () => {
    vi.mocked(Notifications.scheduleNotificationAsync).mockRejectedValueOnce(
      new Error("Unavailable"),
    );
    await TorrentsNotifierTask();
    expect(storeState).toHaveBeenLastCalledWith({
      servers: { remote: { lastUpdate: 10 } },
    });
    await TorrentsNotifierTask();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    expect(storeState).toHaveBeenLastCalledWith({
      servers: { remote: { lastUpdate: 100 } },
    });
  });

  it("uses the request start time as the checkpoint", async () => {
    getTorrents.mockImplementationOnce(async () => {
      vi.mocked(Date.now).mockReturnValue(110_000);
      return [];
    });
    await TorrentsNotifierTask();
    expect(storeState).toHaveBeenCalledWith({
      servers: { remote: { lastUpdate: 100 } },
    });
  });
});
