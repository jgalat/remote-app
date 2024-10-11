import AsyncStorage from "@react-native-async-storage/async-storage";

type TorrentsNotifierState = {
  lastUpdate: number;
};

const initState: TorrentsNotifierState = {
  lastUpdate: 0,
};

const KEY = "@torrents-notifier";

export async function loadState(): Promise<TorrentsNotifierState> {
  const value = await AsyncStorage.getItem(KEY);
  if (value == null) {
    return initState;
  }

  return JSON.parse(value) as TorrentsNotifierState;
}

export async function storeState(state: TorrentsNotifierState): Promise<void> {
  const value = JSON.stringify(state);
  return await AsyncStorage.setItem(KEY, value);
}
