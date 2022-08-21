import * as React from "react";
import useSWR from "swr";
import TransmissionClient, {
  Methods,
  TorrentRemoveRequest,
} from "@remote-app/transmission-client";

import { ClientContext } from "../contexts/transmission-client";

function useTransmission(): TransmissionClient | undefined {
  return React.useContext(ClientContext);
}

export function useTorrents() {
  const client = useTransmission();
  return useSWR(
    client ? [client, "torrent-get-all"] : null,
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
            "recheckProgress",
            "eta",
          ],
        },
      });


      return response?.arguments?.torrents;
    },
    {
      refreshInterval: 5000,
      errorRetryCount: 3,
    }
  );
}

export function useSession() {
  const client = useTransmission();
  return useSWR(
    client ? [client, "session-get"] : null,
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

export function useTorrentAction(id: number) {
  const client = useTransmission();
  const { mutate } = useTorrents();

  const createAction = React.useCallback(
    <
      T extends Extract<
        Methods,
        | "torrent-start"
        | "torrent-start-now"
        | "torrent-stop"
        | "torrent-verify"
        | "torrent-reannounce"
        | "torrent-remove"
      >
    >(
      action: T
    ) => {
      return async (
        params: T extends "torrent-remove"
          ? Pick<TorrentRemoveRequest, "delete-local-data"> | undefined
          : undefined = undefined
      ): Promise<void> => {
        if (!client) {
          return;
        }

        const args =
          params !== undefined ? { ids: id, ...params } : { ids: id };

        await client.request({
          method: action,
          arguments: {
            ...args,
          },
        });

        setTimeout(() => mutate(), 500);
      };
    },
    [client, id, mutate]
  );

  const start = createAction("torrent-start");
  const startNow = createAction("torrent-start-now");
  const stop = createAction("torrent-stop");
  const verify = createAction("torrent-verify");
  const reannounce = createAction("torrent-reannounce");
  const remove = createAction("torrent-remove");

  return { start, startNow, stop, verify, reannounce, remove };
}
