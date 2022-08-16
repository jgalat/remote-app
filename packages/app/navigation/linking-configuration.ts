import { LinkingOptions } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { RootStackParamList } from "../types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL("/"), "magnet:"],
  config: {
    screens: {
      Root: {
        screens: {
          Torrents: {
            path: "/",
          },
          SettingsStack: {
            path: "/settings",
            initialRouteName: "Settings",
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
          AddTorrentStack: {
            path: "/add",
            initialRouteName: "AddTorrent",
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
