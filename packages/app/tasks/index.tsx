import * as TaskManager from "expo-task-manager";

import TorrentsNotifierTask, {
  TORRENTS_NOTIFIER_TASK,
} from "./torrents-notifier";

TaskManager.defineTask(TORRENTS_NOTIFIER_TASK, TorrentsNotifierTask);

export {};
