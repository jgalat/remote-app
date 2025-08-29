import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import TransmissionClient from "@remote-app/transmission-client";

import { loadSettings } from "~/store/settings";
import { loadState, storeState } from "~/store/task-torrents-notifier";
import { isTestingServer } from "~/utils/mock-transmission-client";

export const TORRENTS_NOTIFIER_TASK = "torrents-notifier";

export default async function TorrentsNotifierTask(): Promise<BackgroundTask.BackgroundTaskResult> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || !state.isInternetReachable) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  const { server } = loadSettings();
  if (!server) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  if (isTestingServer(server)) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  const client = new TransmissionClient({
    url: server.url,
    username: server.username,
    password: server.password,
  });

  try {
    const response = await client.request({
      method: "torrent-get",
      arguments: {
        fields: ["id", "doneDate"],
      },
    });

    const torrents = response.arguments?.torrents;
    if (!torrents) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    const { lastUpdate } = loadState();
    const done = torrents.filter((t) => t.doneDate! > lastUpdate);

    const now = Math.floor(Date.now() / 1000);
    storeState({ lastUpdate: now });

    if (done.length === 0 || lastUpdate === 0) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Finished torrents",
        body: `${done.length} ${
          done.length === 1 ? "torrent has" : "torrents have"
        } finished downloading`,
      },
      trigger: null,
    });
  } catch {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  return BackgroundTask.BackgroundTaskResult.Success;
}

export async function isTorrentsNotifierTaskRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(TORRENTS_NOTIFIER_TASK);
}

export async function registerTorrentsNotifierTask(): Promise<void> {
  return BackgroundTask.registerTaskAsync(TORRENTS_NOTIFIER_TASK, {
    minimumInterval: 15,
  });
}

export async function unregisterTorrentsNotifierTask(): Promise<void> {
  return BackgroundTask.unregisterTaskAsync(TORRENTS_NOTIFIER_TASK);
}
