import * as React from "react";
import { ToastAndroid } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TransmissionClient, {
  Methods,
  SessionGetResponse,
  SessionSetRequest,
  TorrentRemoveRequest,
  Torrent,
  TransmissionError,
  HTTPError,
  TorrentAddRequest,
  TorrentAddResponse,
  FreeSpaceResponse,
  SessionStatsResponse,
  TorrentStatus,
} from "@remote-app/transmission-client";

import { useServer } from "./use-settings";
import useTorrentSelection from "./use-torrent-selection";
import MockTransmissionClient, {
  isTestingServer,
} from "~/utils/mock-transmission-client";
import { queryKeys, queryMatchers } from "./query-keys";

function useTransmission(): TransmissionClient | null {
  const server = useServer();
  return React.useMemo(() => {
    if (!server) {
      return null;
    }

    if (isTestingServer(server)) {
      return new MockTransmissionClient() as TransmissionClient;
    }

    return new TransmissionClient({
      url: server.url,
      username: server.username,
      password: server.password,
    });
  }, [server]);
}

const fields = [
  "id",
  "addedDate",
  "doneDate",
  "name",
  "totalSize",
  "error",
  "errorString",
  "eta",
  "isFinished",
  "isStalled",
  "leftUntilDone",
  "metadataPercentComplete",
  "peersConnected",
  "peersGettingFromUs",
  "peersSendingToUs",
  "percentDone",
  "queuePosition",
  "rateDownload",
  "rateUpload",
  "recheckProgress",
  "seedRatioMode",
  "seedRatioLimit",
  "sizeWhenDone",
  "status",
  "trackers",
  "downloadDir",
  "uploadedEver",
  "uploadRatio",
  "webseedsSendingToUs",
  "activityDate",
  "corruptEver",
  "desiredAvailable",
  "downloadedEver",
  "fileStats",
  "haveUnchecked",
  "haveValid",
  "peers",
  "startDate",
  "trackerStats",
  "comment",
  "creator",
  "dateCreated",
  "files",
  "hashString",
  "isPrivate",
  "pieceCount",
  "pieceSize",
  "magnetLink",
] as const;

type HookError = TransmissionError | HTTPError;

type QueryProps = { stale?: boolean };

export function useTorrents({ stale = false }: QueryProps = { stale: false }) {
  const client = useTransmission();
  const server = useServer();
  return useQuery<Torrent[] | undefined, HookError>({
    queryKey: queryKeys.torrentGet(server),
    queryFn: async () => {
      const response = await client?.request({
        method: "torrent-get",
        arguments: { fields: [...fields] },
      });

      return response?.arguments?.torrents;
    },
    enabled: Boolean(client) && !stale,
    refetchInterval: (query) => (query.state.status === "error" ? false : 5000),
    staleTime: 5000,
  });
}

export function useTorrent(id: number) {
  const torrents = useTorrents();
  if (!torrents.data) {
    return torrents;
  }

  return {
    ...torrents,
    data: torrents.data.filter((torrent) => torrent.id === id),
  };
}

export function useSession({ stale = false }: QueryProps = { stale: false }) {
  const client = useTransmission();
  const server = useServer();
  return useQuery<SessionGetResponse | undefined, HookError>({
    queryKey: queryKeys.sessionGet(server),
    queryFn: async () => {
      const response = await client?.request({
        method: "session-get",
      });

      return response?.arguments;
    },
    enabled: Boolean(client) && !stale,
    staleTime: 5000,
  });
}

export function useSessionSet() {
  const queryClient = useQueryClient();
  const client = useTransmission();
  const server = useServer();

  return useMutation<
    void,
    HookError,
    SessionSetRequest,
    { previous?: SessionGetResponse }
  >({
    mutationFn: async (params: SessionSetRequest): Promise<void> => {
      await client?.request({
        method: "session-set",
        arguments: params,
      });
    },
    onMutate: async (params: SessionSetRequest) => {
      await queryClient.cancelQueries(queryMatchers.session(server));
      const previous = queryClient.getQueryData<SessionGetResponse | undefined>(
        queryKeys.sessionGet(server)
      );

      queryClient.setQueryData(
        queryKeys.sessionGet(server),
        (
          old: SessionGetResponse | undefined
        ): SessionGetResponse | undefined => {
          if (!old) {
            return;
          }
          return { ...old, ...params };
        }
      );

      return { previous };
    },
    onError: (_err, _params, context) => {
      queryClient.setQueryData(queryKeys.sessionGet(server), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryMatchers.session(server));
    },
  });
}

export function useFreeSpace() {
  const client = useTransmission();
  const server = useServer();
  const { data: session } = useSession({ stale: true });
  return useQuery<FreeSpaceResponse | undefined, HookError>({
    queryKey: queryKeys.freeSpace(server, session?.["download-dir"]),
    queryFn: async () => {
      if (!session?.["download-dir"]) {
        return;
      }

      const response = await client?.request({
        method: "free-space",
        arguments: {
          path: session["download-dir"],
        },
      });

      return response?.arguments;
    },
    enabled: Boolean(client && session?.["download-dir"]),
    staleTime: 5000,
  });
}

export function useSessionStats(
  { stale = false }: QueryProps = { stale: false }
) {
  const client = useTransmission();
  const server = useServer();
  return useQuery<SessionStatsResponse | undefined, HookError>({
    queryKey: queryKeys.sessionStats(server),
    queryFn: async () => {
      const response = await client?.request({
        method: "session-stats",
      });

      return response?.arguments;
    },
    enabled: Boolean(client) && !stale,
    refetchInterval: (query) => (query.state.status === "error" ? false : 5000),
    staleTime: 5000, // Override global for real-time data
  });
}

export function useAddTorrent() {
  const queryClient = useQueryClient();
  const client = useTransmission();
  const server = useServer();

  return useMutation<
    TorrentAddResponse | undefined,
    HookError,
    TorrentAddRequest
  >({
    mutationFn: async (
      params: TorrentAddRequest
    ): Promise<TorrentAddResponse | undefined> => {
      const response = await client?.request({
        method: "torrent-add",
        arguments: params,
      });

      return response?.arguments;
    },
    onMutate: async () => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryMatchers.torrents(server));
    },
  });
}

type TorrentActionMutationParams<T> = T extends "torrent-remove"
  ? TorrentRemoveRequest
  : Pick<TorrentRemoveRequest, "ids">;

export function useTorrentAction<
  T extends Extract<
    Methods,
    | "torrent-start"
    | "torrent-start-now"
    | "torrent-stop"
    | "torrent-verify"
    | "torrent-reannounce"
    | "torrent-remove"
  >,
>(action: T) {
  const queryClient = useQueryClient();
  const client = useTransmission();
  const server = useServer();
  const { clear } = useTorrentSelection();

  return useMutation({
    mutationFn: async (
      params: TorrentActionMutationParams<T>
    ): Promise<void> => {
      await client?.request({
        method: action,
        arguments: params,
      });
    },
    onMutate: async (params: TorrentActionMutationParams<T>) => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));

      const previous = queryClient.getQueryData<Torrent[] | undefined>(
        queryKeys.torrentGet(server)
      );

      const ids = (
        Array.isArray(params.ids)
          ? params.ids
          : typeof params.ids === "number"
          ? [params.ids]
          : []
      ).map(Number);

      queryClient.setQueryData(
        queryKeys.torrentGet(server),
        (old: Torrent[] | undefined): Torrent[] | undefined => {
          if (!old) {
            return;
          }

          if (action === "torrent-remove") {
            return old.filter((torrent) => !ids.includes(torrent.id));
          }

          return old.map((torrent) => {
            if (ids.includes(torrent.id)) {
              return { ...torrent, status: getStatus(action, torrent) };
            }

            return torrent;
          });
        }
      );

      return { previous };
    },
    onError: (_error, _params, context) => {
      queryClient.setQueryData(queryKeys.torrentGet(server), context?.previous);
      ToastAndroid.show("Failed to perform action", ToastAndroid.SHORT);
    },
    onSettled: () => {
      clear();
      setTimeout(
        () => queryClient.invalidateQueries(queryMatchers.torrents(server)),
        500
      );
    },
  });
}

function getStatus(
  action:
    | "torrent-start"
    | "torrent-start-now"
    | "torrent-stop"
    | "torrent-verify"
    | "torrent-reannounce",
  torrent: Torrent
): TorrentStatus {
  switch (action) {
    case "torrent-start":
    case "torrent-start-now":
      if (torrent.percentDone === 1) {
        return TorrentStatus.QUEUED_TO_SEED;
      }
      return TorrentStatus.QUEUED_TO_DOWNLOAD;
    case "torrent-stop":
      return TorrentStatus.STOPPED;
    case "torrent-verify":
      return TorrentStatus.QUEUED_TO_VERIFY_LOCAL_DATA;
    default:
      return torrent.status;
  }
}

export function useTorrentActions() {
  const start = useTorrentAction("torrent-start");
  const startNow = useTorrentAction("torrent-start-now");
  const stop = useTorrentAction("torrent-stop");
  const verify = useTorrentAction("torrent-verify");
  const reannounce = useTorrentAction("torrent-reannounce");
  const remove = useTorrentAction("torrent-remove");

  return { start, startNow, stop, verify, reannounce, remove };
}
