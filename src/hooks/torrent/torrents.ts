import { ToastAndroid } from "react-native";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  TorrentId,
  Torrent,
  ExtTorrent,
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

export type { Torrent, ExtTorrent };

type QueryProps = { stale?: boolean };
const optimisticInvalidationDelayMs = 2_000;

export function useTorrents({ stale = false }: QueryProps = { stale: false }): UseQueryResult<Torrent[] | undefined, Error> {
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

export function useTorrent(id: TorrentId): UseQueryResult<ExtTorrent | undefined, Error> {
  const client = useClient();
  const server = useServer();
  return useQuery({
    queryKey: queryKeys.torrentGet(server, id),
    queryFn: async () => client?.getTorrent(id),
    enabled: Boolean(client),
    refetchInterval: (query) => (query.state.status === "error" ? false : 5_000),
    staleTime: 5_000,
  });
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

type RemoveParams = { ids: TorrentId[]; deleteData?: boolean };
type ActionParams = { ids: TorrentId[] } | RemoveParams;

function useAction(
  getAction: (client: NonNullable<ReturnType<typeof useClient>>) => (params: ActionParams) => Promise<void>,
  optimistic?: (old: Torrent[] | undefined, ids: TorrentId[]) => Torrent[] | undefined,
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
      const previous = queryClient.getQueryData<Torrent[] | undefined>(queryKeys.torrentGet(server));

      if (optimistic) {
        const ids = Array.isArray(params.ids) ? params.ids : [params.ids];
        queryClient.setQueryData(queryKeys.torrentGet(server), (old: Torrent[] | undefined) => optimistic(old, ids));
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
        optimisticInvalidationDelayMs
      );
    },
  });
}

function getOptimisticStatus(action: string, torrent: Torrent): number {
  switch (action) {
    case "start":
    case "startNow":
      return torrent.percentDone >= 1 ? TorrentStatus.QUEUED_TO_SEED : TorrentStatus.QUEUED_TO_DOWNLOAD;
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
    (c) => (p) => c.startTorrents(p.ids as TorrentId[]),
    (old, ids) => old?.map((t) => (ids.includes(t.id) ? { ...t, status: getOptimisticStatus("start", t) } : t)),
  );

  const startNow = useAction(
    (c) => (p) => c.startTorrentsNow(p.ids as TorrentId[]),
    (old, ids) => old?.map((t) => (ids.includes(t.id) ? { ...t, status: getOptimisticStatus("startNow", t) } : t)),
  );

  const stop = useAction(
    (c) => (p) => c.stopTorrents(p.ids as TorrentId[]),
    (old, ids) => old?.map((t) => (ids.includes(t.id) ? { ...t, status: getOptimisticStatus("stop", t) } : t)),
  );

  const verify = useAction(
    (c) => (p) => c.verifyTorrents(p.ids as TorrentId[]),
    (old, ids) => old?.map((t) => (ids.includes(t.id) ? { ...t, status: getOptimisticStatus("verify", t) } : t)),
  );

  const reannounce = useAction(
    (c) => (p) => c.reannounceTorrents(p.ids as TorrentId[]),
  );

  const remove = useAction(
    (c) => (p) => c.removeTorrents(p.ids as TorrentId[], (p as RemoveParams).deleteData),
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
        optimisticInvalidationDelayMs
      );
    },
  });
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

      const previous = queryClient.getQueryData<ExtTorrent | undefined>(queryKeys.torrentGet(server, id));

      queryClient.setQueryData(
        queryKeys.torrentGet(server, id),
        (old: ExtTorrent | undefined): ExtTorrent | undefined => {
          if (!old) return;

          const fs = [...old.fileStats];

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

          return { ...old, fileStats: fs };
        },
      );

      return { previous };
    },
    onError: (_error, _params, context) => {
      queryClient.setQueryData(queryKeys.torrentGet(server, id), context?.previous);
      ToastAndroid.show("Failed to perform action", ToastAndroid.SHORT);
    },
    onSettled: () => {
      setTimeout(
        () => queryClient.invalidateQueries(queryMatchers.torrents(server)),
        optimisticInvalidationDelayMs
      );
    },
  });
}
