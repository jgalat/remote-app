import { ToastAndroid } from "react-native";
import i18n from "~/i18n";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  Methods,
  TorrentRemoveRequest,
  Torrent as _Torrent,
  TransmissionError,
  HTTPError,
  TorrentAddRequest,
  TorrentAddResponse,
  TorrentStatus,
  TorrentSetRequest,
  TorrentSetLocationRequest,
  Priority,
} from "@remote-app/transmission-client";

import { useServer } from "../use-settings";
import useTorrentSelection from "../use-torrent-selection";
import { useTransmission } from "./client";
import { queryKeys, queryMatchers } from "./query-keys";

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
  "leftUntilDone",
  "peersConnected",
  "peersGettingFromUs",
  "peersSendingToUs",
  "percentDone",
  "queuePosition",
  "rateDownload",
  "rateUpload",
  "recheckProgress",
  "sizeWhenDone",
  "status",
  "uploadedEver",
  "uploadRatio",
  "webseedsSendingToUs",
  "activityDate",
  "magnetLink",
  "downloadDir",
] as const;

const selectFields = [
  ...fields,
  "files",
  "fileStats",
  "peers",
  "trackerStats",
  "downloadedEver",
  "pieceCount",
  "pieceSize",
  "pieces",
  "bandwidthPriority",
  "honorsSessionLimits",
  "downloadLimited",
  "downloadLimit",
  "uploadLimited",
  "uploadLimit",
  "seedRatioMode",
  "seedRatioLimit",
  "seedIdleMode",
  "seedIdleLimit",
] as const;

type HookError = TransmissionError | HTTPError;

type QueryProps = { stale?: boolean };

type RequiredFields<T, Arr extends readonly (keyof T)[]> = Omit<
  T,
  Arr[number]
> & {
  [K in Arr[number]]-?: NonNullable<T[K]>;
};

export type Torrent = RequiredFields<_Torrent, typeof fields>;
export type ExtTorrent = RequiredFields<_Torrent, typeof selectFields>;

export function useTorrents<T extends number | undefined = undefined>(
  { stale = false, id }: QueryProps & { id?: T } = { stale: false }
): UseQueryResult<
  T extends number ? ExtTorrent[] | undefined : Torrent[] | undefined,
  HookError
> {
  const client = useTransmission();
  const server = useServer();
  return useQuery({
    queryKey: queryKeys.torrentGet(server, id),
    queryFn: async () => {
      const select = typeof id === "number";
      const response = await client?.request({
        method: "torrent-get",
        arguments: {
          fields: select ? [...selectFields] : [...fields],
          ids: select ? [id] : undefined,
        },
      });

      const torrents = response?.arguments?.torrents;
      if (!torrents) return torrents;
      return (
        select
          ? (torrents as unknown as ExtTorrent[])
          : (torrents as unknown as Torrent[])
      ) as T extends number ? ExtTorrent[] : Torrent[];
    },
    enabled: Boolean(client) && !stale,
    refetchInterval: (query) => (query.state.status === "error" ? false : 5000),
    staleTime: 5000,
  });
}

export function useTorrent(id: number) {
  return useTorrents({ id });
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
            return old.filter((torrent) => !ids.includes(torrent.id!));
          }

          return old.map((torrent) => {
            if (ids.includes(torrent.id!)) {
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
      ToastAndroid.show(i18n.t("failed_to_perform_action"), ToastAndroid.SHORT);
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

export function useTorrentSetLocation() {
  const queryClient = useQueryClient();
  const client = useTransmission();
  const server = useServer();
  const { clear } = useTorrentSelection();

  return useMutation({
    mutationFn: async (params: TorrentSetLocationRequest): Promise<void> => {
      await client?.request({
        method: "torrent-set-location",
        arguments: params,
      });
    },
    onError: () => {
      ToastAndroid.show(i18n.t("failed_to_move_torrent"), ToastAndroid.SHORT);
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

export function useTorrentSet(id: number) {
  const queryClient = useQueryClient();
  const client = useTransmission();
  const server = useServer();

  return useMutation({
    mutationFn: async (params: TorrentSetRequest): Promise<void> => {
      await client?.request({
        method: "torrent-set",
        arguments: { ids: [id], ...params },
      });
    },
    onMutate: async (params: TorrentSetRequest) => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));

      const previous = queryClient.getQueryData<ExtTorrent[] | undefined>(
        queryKeys.torrentGet(server, id)
      );

      queryClient.setQueryData(
        queryKeys.torrentGet(server, id),
        (old: ExtTorrent[] | undefined): ExtTorrent[] | undefined => {
          if (!old) {
            return;
          }

          return old.map((torrent) => {
            if (torrent.id !== id) {
              return torrent;
            }

            const fs = [...torrent.fileStats];

            for (const i of params["files-wanted"] ?? []) {
              fs[i] = { ...fs[i], wanted: true };
            }

            for (const i of params["files-unwanted"] ?? []) {
              fs[i] = { ...fs[i], wanted: false };
            }

            for (const i of params["priority-low"] ?? []) {
              fs[i] = { ...fs[i], priority: Priority.LOW };
            }

            for (const i of params["priority-normal"] ?? []) {
              fs[i] = { ...fs[i], priority: Priority.NORMAL };
            }

            for (const i of params["priority-high"] ?? []) {
              fs[i] = { ...fs[i], priority: Priority.HIGH };
            }

            return { ...torrent, fileStats: fs };
          });
        }
      );

      return { previous };
    },
    onError: (_error, _params, context) => {
      queryClient.setQueryData(
        queryKeys.torrentGet(server, id),
        context?.previous
      );
      ToastAndroid.show(i18n.t("failed_to_perform_action"), ToastAndroid.SHORT);
    },
    onSettled: () => {
      setTimeout(
        () => queryClient.invalidateQueries(queryMatchers.torrents(server)),
        500
      );
    },
  });
}
