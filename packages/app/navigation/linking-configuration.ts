import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Root: {
        screens: {
          Torrents: {
            path: "/",
          },
          SettingsRoot: {
            path: "/settings",
            screens: {
              Settings: {
                path: "/",
              },
              ConnectionSetup: {
                path: "/connection",
              },
              Theme: {
                path: "/theme",
              },
            },
          },
          AddTorrentRoot: {
            path: "/add",
            screens: {
              AddTorrent: {
                path: "/",
              },
              File: {
                path: "/file"
              },
              Magnet: {
                path: "/magnet"
              },
            },
          },
          TorrentDetails: {
            path: "/torrents/:id",
          },
        },
      },
      NotFound: "*",
    },
  },
};

export default linking;
