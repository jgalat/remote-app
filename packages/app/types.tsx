import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: undefined;
  TorrentDetails: { id: number };
  SettingsStack: NavigatorScreenParams<SettingsStackParamList> | undefined;
  AddTorrentFile: undefined;
  AddTorrentMagnet: { uri?: string };
  NotFound: undefined;
};

export type SettingsStackParamList = {
  Settings: undefined;
  ConnectionSetup: undefined;
  ServerConfiguration: undefined;
  Theme: undefined;
  Security: undefined;
  About: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type SettingsStackScreenProps<
  Screen extends keyof SettingsStackParamList,
> = NativeStackScreenProps<SettingsStackParamList, Screen>;
