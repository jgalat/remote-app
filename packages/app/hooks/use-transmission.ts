import * as React from "react";
import useSWR from "swr";

import { ClientContext } from "../contexts/transmission-client";

function useTransmission() {
  return React.useContext(ClientContext);
}

export function useTorrents() {
  const client = useTransmission();
  return useSWR(
    client ? "all-torrents" : null,
    async () => {
      const response = await client?.request({
        method: "torrent-get",
        arguments: {
          fields: [
            "id",
            "name",
            "status",
            "percentDone",
            "rateDownload",
            "rateUpload",
            "queuePosition",
          ],
        },
      });

      return response?.arguments?.torrents;
    },
    {
      refreshInterval: 3000,
    }
  );
}
