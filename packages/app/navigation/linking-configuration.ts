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
                path: "/"
              },
              Server: {
                path: "/server"
              },
              Theme: {
                path: "/theme"
              },
            }
          },
          AddTorrent: {
            path: "/add-torrent",
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
