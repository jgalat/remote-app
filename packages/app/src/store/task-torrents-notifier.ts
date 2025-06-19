import { storage } from "./storage";

type TorrentsNotifierState = {
  lastUpdate: number;
};

const initState: TorrentsNotifierState = {
  lastUpdate: 0,
};

const KEY = "internal.torrents-notifier";

export function loadState(): TorrentsNotifierState {
  const value = storage.getString(KEY);

  if (value === undefined) {
    return initState;
  }

  try {
    const state = JSON.parse(value) as TorrentsNotifierState;
    return {
      ...initState,
      ...state,
    };
  } catch {
    storeState(initState);
    return initState;
  }
}

export function storeState(state: TorrentsNotifierState): void {
  const value = JSON.stringify(state);
  return storage.set(KEY, value);
}
