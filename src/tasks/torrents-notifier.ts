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

  let disconnected = false;
  if (servers.some((server) => server.type !== "local")) {
    const state = await Network.getNetworkStateAsync().catch(() => undefined);
    disconnected = state?.isConnected === false;
  }

  let notifierState = loadState();

  for (const server of servers) {
    if (isTestingServer(server)) continue;
    if (server.type === "local" && !isLocalEngineAvailable()) continue;

    if (server.type !== "local" && disconnected) continue;

    try {
      const now = Math.floor(Date.now() / 1_000);
      const client = createClient(server);
      const torrents = await client.getTorrents();

      const lastUpdate = getServerLastUpdate(notifierState, server.id);
      const done = torrents.filter((t) => t.doneDate > lastUpdate);

      if (done.length > 0 && lastUpdate !== 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Finished torrents",
            body: `${server.name}: ${done.length} ${
              done.length === 1 ? "torrent has" : "torrents have"
            } finished downloading`,
          },
          trigger: null,
        });
      }

      notifierState = setServerLastUpdate(notifierState, server.id, now);
    } catch {
      // continue to next server
    }
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
