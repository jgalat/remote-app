import * as BackgroundTask from "expo-background-task";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";

import { createClient } from "~/client";
import "~/store/migrations";
import { loadServers } from "~/store/servers";
import {
  loadState,
  storeState,
  getServerLastUpdate,
  setServerLastUpdate,
} from "~/store/task-torrents-notifier";
import { isTestingServer } from "~/utils/mock-transmission-client";
import { isLocalEngineAvailable } from "@remote-app/pro";

export const TORRENTS_NOTIFIER_TASK = "torrents-notifier";

export default async function TorrentsNotifierTask(): Promise<BackgroundTask.BackgroundTaskResult> {
  const { servers } = loadServers();
  if (servers.length === 0) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  const remoteOnly = servers.filter((s) => s.type !== "local");
  if (remoteOnly.length > 0) {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected || !state.isInternetReachable) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }
  }

  let notifierState = loadState();

  const eligible = servers.filter(
    (s) =>
      !isTestingServer(s) && (s.type !== "local" || isLocalEngineAvailable())
  );

  const results = await Promise.all(
    eligible.map(async (server) => {
      const lastUpdate = getServerLastUpdate(notifierState, server.id);
      const now = Math.floor(Date.now() / 1_000);
      try {
        const torrents = await createClient(server).getTorrents();
        const doneCount = torrents.reduce(
          (n, t) => (t.doneDate > lastUpdate ? n + 1 : n),
          0
        );
        return { server, lastUpdate, now, doneCount, ok: true as const };
      } catch {
        return { server, lastUpdate, now, doneCount: 0, ok: false as const };
      }
    })
  );

  const notifications: Promise<unknown>[] = [];
  for (const { server, lastUpdate, now, doneCount, ok } of results) {
    if (!ok) continue;
    notifierState = setServerLastUpdate(notifierState, server.id, now);
    if (doneCount === 0 || lastUpdate === 0) continue;
    notifications.push(
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Finished torrents",
          body: `${server.name}: ${doneCount} ${
            doneCount === 1 ? "torrent has" : "torrents have"
          } finished downloading`,
        },
        trigger: null,
      })
    );
  }
  if (notifications.length > 0) {
    await Promise.all(notifications);
  }

  storeState(notifierState);
  return BackgroundTask.BackgroundTaskResult.Success;
}

export async function registerTorrentsNotifierTask(): Promise<void> {
  return BackgroundTask.registerTaskAsync(TORRENTS_NOTIFIER_TASK, {
    minimumInterval: 15,
  });
}

export async function unregisterTorrentsNotifierTask(): Promise<void> {
  return BackgroundTask.unregisterTaskAsync(TORRENTS_NOTIFIER_TASK);
}
