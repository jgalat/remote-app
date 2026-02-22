import { ToastAndroid } from "react-native";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";

import type {
  TorrentId,
  TorrentListItem,
  TorrentInfoDetail,
  TorrentSettingsDetail,
  TorrentFilesDetail,
  TorrentPeersDetail,
  TorrentTrackersDetail,
  TorrentPiecesDetail,
  AddTorrentParams,
  AddTorrentResult,
  SetTorrentParams,
  SetLocationParams,
} from "~/client";
import { TorrentStatus, Priority } from "~/client";
import { useServer } from "~/hooks/use-settings";
import useTorrentSelection from "~/hooks/use-torrent-selection";
import { useClient } from "./client";
import { queryKeys, queryMatchers } from "./query-keys";

export type Torrent = TorrentListItem;
export type TorrentInfo = TorrentInfoDetail;
export type TorrentSettings = TorrentSettingsDetail;
export type TorrentFiles = TorrentFilesDetail;
export type TorrentPeers = TorrentPeersDetail;
export type TorrentTrackers = TorrentTrackersDetail;
export type TorrentPieces = TorrentPiecesDetail;

type QueryProps = { stale?: boolean };
const optimisticInvalidationDelayMs = 2_000;

function useTorrentDetailQuery<T>(
  id: TorrentId,
  queryKey: readonly unknown[],
  queryFn: (id: TorrentId) => Promise<T | undefined>,
): UseQueryResult<T | undefined, Error> {
  const client = useClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!client) return undefined;
      return queryFn(id);
    },
    enabled: Boolean(client),
    refetchInterval: (query) => (query.state.status === "error" ? false : 5_000),
    staleTime: 5_000,
  });
}

export function useTorrents({
  stale = false,
}: QueryProps = { stale: false }): UseQueryResult<Torrent[] | undefined, Error> {
  const client = useClient();
  const server = useServer();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.torrentGet(server),
    queryFn: async ({ signal }) => {
      const data = await client?.getTorrents();
      if (signal?.aborted) throw new Error("aborted");
      return data;
    },
    enabled: Boolean(client) && !stale,
    refetchInterval: (query) => {
      if (query.state.status === "error") return false;
      if (queryClient.isMutating()) return false;
      return 5_000;
    },
    staleTime: 5_000,
  });
}

export function useTorrentInfo(
  id: TorrentId,
): UseQueryResult<TorrentInfo | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentInfo(server, id),
    async (torrentId) => client?.getTorrentInfo(torrentId),
  );
}

export function useTorrentSettings(
  id: TorrentId,
): UseQueryResult<TorrentSettings | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentSettings(server, id),
    async (torrentId) => client?.getTorrentSettings(torrentId),
  );
}

export function useTorrentFiles(
  id: TorrentId,
): UseQueryResult<TorrentFiles | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentFiles(server, id),
    async (torrentId) => client?.getTorrentFiles(torrentId),
  );
}

export function useTorrentPeers(
  id: TorrentId,
): UseQueryResult<TorrentPeers | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentPeers(server, id),
    async (torrentId) => client?.getTorrentPeers(torrentId),
  );
}

export function useTorrentTrackers(
  id: TorrentId,
): UseQueryResult<TorrentTrackers | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentTrackers(server, id),
    async (torrentId) => client?.getTorrentTrackers(torrentId),
  );
}

export function useTorrentPieces(
  id: TorrentId,
): UseQueryResult<TorrentPieces | undefined, Error> {
  const server = useServer();
  const client = useClient();
  return useTorrentDetailQuery(
    id,
    queryKeys.torrentPieces(server, id),
    async (torrentId) => client?.getTorrentPieces(torrentId),
  );
}

export function useAddTorrent() {
  const queryClient = useQueryClient();
  const client = useClient();
  const server = useServer();

  return useMutation<AddTorrentResult | null | undefined, Error, AddTorrentParams>({
    mutationFn: async (params: AddTorrentParams) => client?.addTorrent(params),
    onMutate: async () => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));
    },
    onSettled: () => {
      queryClient.invalidateQueries(queryMatchers.torrents(server));
    },
  });
}

type ActionParams = {
  ids: TorrentId[];
  deleteData?: boolean;
};

function useAction(
  getAction: (
    client: NonNullable<ReturnType<typeof useClient>>,
  ) => (params: ActionParams) => Promise<void>,
  optimistic?: (
    old: Torrent[] | undefined,
    ids: TorrentId[],
  ) => Torrent[] | undefined,
) {
  const queryClient = useQueryClient();
  const client = useClient();
  const server = useServer();
  const { clear } = useTorrentSelection();

  return useMutation({
    mutationFn: async (params: ActionParams) => {
      if (!client) return;
      await getAction(client)(params);
    },
    onMutate: async (params: ActionParams) => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));
      const previous = queryClient.getQueryData<Torrent[] | undefined>(
        queryKeys.torrentGet(server),
      );

      if (optimistic) {
        queryClient.setQueryData(
          queryKeys.torrentGet(server),
          (old: Torrent[] | undefined) => optimistic(old, params.ids),
        );
      }

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
        optimisticInvalidationDelayMs,
      );
    },
  });
}

function getOptimisticStatus(action: string, torrent: Torrent): number {
  switch (action) {
    case "start":
    case "startNow":
      return torrent.percentDone >= 1
        ? TorrentStatus.QUEUED_TO_SEED
        : TorrentStatus.QUEUED_TO_DOWNLOAD;
    case "stop":
      return TorrentStatus.STOPPED;
    case "verify":
      return TorrentStatus.QUEUED_TO_VERIFY_LOCAL_DATA;
    default:
      return torrent.status;
  }
}

export function useTorrentActions() {
  const start = useAction(
    (c) => (p) => c.startTorrents(p.ids),
    (old, ids) =>
      old?.map((t) =>
        ids.includes(t.id) ? { ...t, status: getOptimisticStatus("start", t) } : t,
      ),
  );

  const startNow = useAction(
    (c) => (p) => c.startTorrentsNow(p.ids),
    (old, ids) =>
      old?.map((t) =>
        ids.includes(t.id)
          ? { ...t, status: getOptimisticStatus("startNow", t) }
          : t,
      ),
  );

  const stop = useAction(
    (c) => (p) => c.stopTorrents(p.ids),
    (old, ids) =>
      old?.map((t) =>
        ids.includes(t.id) ? { ...t, status: getOptimisticStatus("stop", t) } : t,
      ),
  );

  const verify = useAction(
    (c) => (p) => c.verifyTorrents(p.ids),
    (old, ids) =>
      old?.map((t) =>
        ids.includes(t.id) ? { ...t, status: getOptimisticStatus("verify", t) } : t,
      ),
  );

  const reannounce = useAction((c) => (p) => c.reannounceTorrents(p.ids));

  const remove = useAction(
    (c) => (p) => c.removeTorrents(p.ids, p.deleteData),
    (old, ids) => old?.filter((t) => !ids.includes(t.id)),
  );

  return { start, startNow, stop, verify, reannounce, remove };
}

export function useTorrentSetLocation() {
  const queryClient = useQueryClient();
  const client = useClient();
  const server = useServer();
  const { clear } = useTorrentSelection();

  return useMutation({
    mutationFn: async (params: SetLocationParams) => {
      await client?.setLocation(params);
    },
    onError: () => {
      ToastAndroid.show("Failed to move torrent", ToastAndroid.SHORT);
    },
    onSettled: () => {
      clear();
      setTimeout(
        () => queryClient.invalidateQueries(queryMatchers.torrents(server)),
        optimisticInvalidationDelayMs,
      );
    },
  });
}

function hasFilePriorityChanges(params: SetTorrentParams): boolean {
  return Boolean(
    params["files-wanted"] ||
      params["files-unwanted"] ||
      params["priority-low"] ||
      params["priority-normal"] ||
      params["priority-high"],
  );
}

export function useTorrentSet(id: TorrentId) {
  const queryClient = useQueryClient();
  const client = useClient();
  const server = useServer();

  return useMutation({
    mutationFn: async (params: SetTorrentParams) => {
      await client?.setTorrent([id], params);
    },
    onMutate: async (params: SetTorrentParams) => {
      await queryClient.cancelQueries(queryMatchers.torrents(server));

      if (!hasFilePriorityChanges(params)) {
        return { previous: undefined };
      }

      const key = queryKeys.torrentFiles(server, id);
      const previous = queryClient.getQueryData<TorrentFiles | undefined>(key);

      queryClient.setQueryData(
        key,
        (old: TorrentFiles | undefined): TorrentFiles | undefined => {
          if (!old) return old;

          const fileStats = [...old.fileStats];

          for (const i of params["files-wanted"] ?? []) {
            fileStats[i] = { ...fileStats[i], wanted: true };
          }
          for (const i of params["files-unwanted"] ?? []) {
            fileStats[i] = { ...fileStats[i], wanted: false };
          }
          for (const i of params["priority-low"] ?? []) {
            fileStats[i] = { ...fileStats[i], priority: Priority.LOW };
          }
          for (const i of params["priority-normal"] ?? []) {
            fileStats[i] = { ...fileStats[i], priority: Priority.NORMAL };
          }
          for (const i of params["priority-high"] ?? []) {
            fileStats[i] = { ...fileStats[i], priority: Priority.HIGH };
          }

          return { ...old, fileStats };
        },
      );

      return { previous };
    },
    onError: (_error, _params, context) => {
      const key = queryKeys.torrentFiles(server, id);
      queryClient.setQueryData(key, context?.previous);
      ToastAndroid.show("Failed to perform action", ToastAndroid.SHORT);
    },
    onSettled: () => {
      setTimeout(
        () => queryClient.invalidateQueries(queryMatchers.torrents(server)),
        optimisticInvalidationDelayMs,
      );
    },
  });
}
