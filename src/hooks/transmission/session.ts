import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  SessionGetResponse,
  SessionSetRequest,
  TransmissionError,
  HTTPError,
  ResponseParseError,
  SessionStatsResponse,
} from "@remote-app/transmission-client";

import { useServer } from "../use-settings";
import { useTransmission } from "./client";
import { useServerClient } from "./client";
import { queryKeys, queryMatchers } from "./query-keys";
import type { Server } from "~/store/settings";

type HookError = TransmissionError | HTTPError | ResponseParseError;

type QueryProps = { stale?: boolean };

export function useSession({ stale = false }: QueryProps = { stale: false }) {
  const client = useTransmission();
  const server = useServer();
  return useQuery<Required<SessionGetResponse> | undefined, HookError>({
    queryKey: queryKeys.sessionGet(server),
    queryFn: async () => {
      const response = await client?.request({
        method: "session-get",
      });

      const session = response?.arguments;
      if (!session) return session;
      return session as Required<SessionGetResponse>;
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
    staleTime: 5000,
  });
}

export function useServerSession(server: Server | undefined) {
  const client = useServerClient(server);
  return useQuery<Required<SessionGetResponse> | undefined>({
    queryKey: ["config-session", server?.id, server?.url],
    queryFn: async () => {
      const response = await client?.request({ method: "session-get" });
      const session = response?.arguments;
      if (!session) return session;
      return session as Required<SessionGetResponse>;
    },
    enabled: Boolean(client),
    staleTime: 5_000,
  });
}

export function useServerSessionSet(server: Server | undefined) {
  const queryClient = useQueryClient();
  const client = useServerClient(server);
  const key = ["config-session", server?.id, server?.url];

  return useMutation<void, Error, SessionSetRequest, { previous?: SessionGetResponse }>({
    mutationFn: async (params) => {
      await client?.request({ method: "session-set", arguments: params });
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<SessionGetResponse | undefined>(key);
      queryClient.setQueryData(key, (old: SessionGetResponse | undefined) => {
        if (!old) return;
        return { ...old, ...params };
      });
      return { previous };
    },
    onError: (_err, _params, context) => {
      queryClient.setQueryData(key, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
