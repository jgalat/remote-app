import { loadDirectories, storeDirectories } from "./directories";
import { loadState, storeState } from "./task-torrents-notifier";

export function cleanupOrphanedData(serverIds: Set<string>): void {
  const dirs = loadDirectories();
  const dirKeys = Object.keys(dirs.servers);
  if (dirKeys.some((id) => !serverIds.has(id))) {
    const filtered = Object.fromEntries(
      dirKeys.filter((id) => serverIds.has(id)).map((id) => [id, dirs.servers[id]])
    );
    storeDirectories({ ...dirs, servers: filtered });
  }

  const state = loadState();
  const stateKeys = Object.keys(state.servers);
  if (stateKeys.some((id) => !serverIds.has(id))) {
    const filtered = Object.fromEntries(
      stateKeys.filter((id) => serverIds.has(id)).map((id) => [id, state.servers[id]])
    );
    storeState({ ...state, servers: filtered });
  }
}
