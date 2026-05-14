import { loadDirectories, storeDirectories } from "./directories";
import { loadState, storeState } from "./task-torrents-notifier";

export function cleanupOrphanedData(serverIds: Set<string>): void {
  const dirs = loadDirectories();
  const dirKeys = Object.keys(dirs.servers);
  if (dirKeys.some((id) => !serverIds.has(id))) {
    const filtered: typeof dirs.servers = {};
    for (const id of dirKeys) {
      if (serverIds.has(id)) filtered[id] = dirs.servers[id];
    }
    storeDirectories({ ...dirs, servers: filtered });
  }

  const state = loadState();
  const stateKeys = Object.keys(state.servers);
  if (stateKeys.some((id) => !serverIds.has(id))) {
    const filtered: typeof state.servers = {};
    for (const id of stateKeys) {
      if (serverIds.has(id)) filtered[id] = state.servers[id];
    }
    storeState({ ...state, servers: filtered });
  }
}
