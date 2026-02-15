import * as BackgroundTask from "expo-background-task";
import * as Network from "expo-network";
import * as Notifications from "expo-notifications";
import TransmissionClient from "@remote-app/transmission-client";

import "~/store/migrations";
import { loadServers } from "~/store/servers";
import {
  loadState,
  storeState,
  getServerLastUpdate,
  setServerLastUpdate,
} from "~/store/task-torrents-notifier";
import { isTestingServer } from "~/utils/mock-transmission-client";
import i18n from "~/i18n";

export const TORRENTS_NOTIFIER_TASK = "torrents-notifier";

export default async function TorrentsNotifierTask(): Promise<BackgroundTask.BackgroundTaskResult> {
  console.log("[torrents-notifier] Task started");

  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected || !state.isInternetReachable) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  const { servers } = loadServers();
  if (servers.length === 0) {
    return BackgroundTask.BackgroundTaskResult.Success;
  }

  let notifierState = loadState();

  for (const server of servers) {
    if (isTestingServer(server)) continue;

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
      if (!torrents) continue;

      const lastUpdate = getServerLastUpdate(notifierState, server.id);
      const done = torrents.filter((t) => t.doneDate! > lastUpdate);

      const now = Math.floor(Date.now() / 1_000);
      notifierState = setServerLastUpdate(notifierState, server.id, now);

      if (done.length === 0 || lastUpdate === 0) continue;

      const body = done.length === 1
        ? i18n.t("notification_finished_one", { server: server.name })
        : i18n.t("notification_finished_other", { server: server.name, value: done.length });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t("notification_finished_title"),
          body,
        },
        trigger: null,
      });
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
