import * as React from "react";
import useSWR, { useSWRConfig } from "swr";
import TransmissionClient, { Methods } from "transmission-client";

import { ClientContext } from "../contexts/transmission-client";

function useTransmission(): TransmissionClient | undefined {
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
      refreshInterval: 2500,
    }
  );
}

export function useSession() {
  const client = useTransmission();
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

function useActionCallback(
  id: number,
  method: Methods,
  client?: TransmissionClient
) {
  const { mutate } = useSWRConfig();

  return React.useCallback(async () => {
    if (!client) {
      return;
    }

    await client.request({
      method,
      arguments: {
        ids: id,
      },
    });

    mutate("torrent-get-all");
  }, [id, method, client, mutate]);
}

export function useTorrentAction(id: number) {
  const client = useTransmission();
  const start = useActionCallback(id, "torrent-start", client);
  const startNow = useActionCallback(id, "torrent-start-now", client);
  const stop = useActionCallback(id, "torrent-stop", client);
  const verify = useActionCallback(id, "torrent-verify", client);
  const reannounce = useActionCallback(id, "torrent-reannounce", client);

  return { start, startNow, stop, verify, reannounce };
}
