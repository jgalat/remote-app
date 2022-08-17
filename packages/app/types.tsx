import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  TorrentDetails: { id: string };
  SettingsStack: NavigatorScreenParams<SettingsStackParamList> | undefined;
  AddTorrentStack: NavigatorScreenParams<AddTorrentStackParamList> | undefined;
  NotFound: undefined;
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
  Magnet: { url?: string };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList
> = NativeStackScreenProps<SettingsStackParamList, Screen>;

export type AddTorrentStackScreenProps<
  Screen extends keyof AddTorrentStackParamList
> = NativeStackScreenProps<AddTorrentStackParamList, Screen>;
