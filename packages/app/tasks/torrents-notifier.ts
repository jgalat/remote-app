import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import TransmissionClient from "@remote-app/transmission-client";

import { loadSettings } from "../store/settings";
import { loadState, storeState } from "../store/task-torrents-notifier";

export const TORRENTS_NOTIFIER_TASK = "torrents-notifier";

export default async function TorrentsNotifierTask(): Promise<BackgroundFetch.BackgroundFetchResult> {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || !state.isInternetReachable) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }

  const { server } = await loadSettings();
  if (!server) {
    return BackgroundFetch.BackgroundFetchResult.NoData;
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
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const { lastUpdate } = await loadState();
    const done = torrents.filter((t) => t.doneDate > lastUpdate);

    const now = Math.floor(Date.now() / 1000);
    await storeState({ lastUpdate: now });

    if (done.length === 0) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
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
  } catch (e) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }

  return BackgroundFetch.BackgroundFetchResult.NewData;
}

export async function isTorrentsNotifierTaskRegistered(): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(TORRENTS_NOTIFIER_TASK);
}

export async function registerTorrentsNotifierTask(): Promise<void> {
  return BackgroundFetch.registerTaskAsync(TORRENTS_NOTIFIER_TASK, {
    minimumInterval: 60 * 5,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterTorrentsNotifierTask(): Promise<void> {
  return BackgroundFetch.unregisterTaskAsync(TORRENTS_NOTIFIER_TASK);
}
