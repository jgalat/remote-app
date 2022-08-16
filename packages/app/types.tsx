import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<HomeStackParamList> | undefined;
  NotFound: undefined;
};

export type HomeStackParamList = {
  Torrents: undefined;
  SettingsStack: NavigatorScreenParams<SettingsStackParamList> | undefined;
  AddTorrentStack: NavigatorScreenParams<AddTorrentStackParamList> | undefined;
  TorrentDetails: { id: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  ConnectionSetup: undefined;
  ServerConfiguration: undefined;
  Theme: undefined;
};

export type AddTorrentStackParamList = {
  AddTorrent: undefined;
  File: undefined;
  Magnet: { url?: string }
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
  NativeStackScreenProps<HomeStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList
> = NativeStackScreenProps<SettingsStackParamList, Screen>;
