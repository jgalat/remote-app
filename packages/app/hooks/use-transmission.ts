import * as React from "react";
import useSWR from "swr";

import { ClientContext } from "../contexts/transmission-client";

function useTransmission() {
  return React.useContext(ClientContext);
}

export function useTorrents() {
  const client = useTransmission();
  return useSWR(
    client ? "torrent-get-all" : null,
    async () => {
      const response = await client?.request({
        method: "torrent-get",
        arguments: {
          fields: [
            "id",
            "name",
            "status",
            "peersConnected",
            "peersSendingToUs",
            "peersGettingFromUs",
            "percentDone",
            "rateDownload",
            "rateUpload",
            "uploadRatio",
            "uploadedEver",
            "totalSize",
            "eta",
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

export function useSession() {
  const client = useTransmission()
  return useSWR(
    client ? "session-get" : null,
    async () => {
      const response = await client?.request({
        method: "session-get",
      });

      return response?.arguments;
    },
    {
      revalidateIfStale: false,
    }
  );
}
