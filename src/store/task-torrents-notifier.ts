import { z } from "zod";

import { storage } from "./storage";

const StateSchema = z.object({
  servers: z.record(z.string(), z.object({ lastUpdate: z.number() })),
});

type TorrentsNotifierState = z.infer<typeof StateSchema>;

const initState: TorrentsNotifierState = {
  servers: {},
};

const KEY = "internal.torrents-notifier";

export function loadState(): TorrentsNotifierState {
  const value = storage.getString(KEY);

  if (value === undefined) {
    return initState;
  }

  try {
    const json: unknown = JSON.parse(value);
    const result = StateSchema.safeParse(json);

    if (result.success) {
      return result.data;
    }

    // legacy or invalid format
    return initState;
  } catch {
    storeState(initState);
    return initState;
  }
}

export function storeState(state: TorrentsNotifierState): void {
  const value = JSON.stringify(state);
  return storage.set(KEY, value);
}

export function getServerLastUpdate(
  state: TorrentsNotifierState,
  serverId: string
): number {
  return state.servers[serverId]?.lastUpdate ?? 0;
}

export function setServerLastUpdate(
  state: TorrentsNotifierState,
  serverId: string,
  lastUpdate: number
): TorrentsNotifierState {
  return {
    ...state,
    servers: {
      ...state.servers,
      [serverId]: { lastUpdate },
    },
  };
}
