import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  TorrentDetails: { id: number };
  SettingsStack: NavigatorScreenParams<SettingsStackParamList> | undefined;
  AddTorrentFile: { uri?: string };
  AddTorrentMagnet: { uri?: string };
  NotFound: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  ConnectionSetup: undefined;
  ServerConfiguration: undefined;
  TaskConfiguration: undefined;
  Theme: undefined;
  About: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList
> = NativeStackScreenProps<SettingsStackParamList, Screen>;
