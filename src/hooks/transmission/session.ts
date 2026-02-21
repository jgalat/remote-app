import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { Session, SessionStats } from "~/client";
import { useServer } from "../use-settings";
import { useClient, useServerClient } from "./client";
import { queryKeys, queryMatchers } from "./query-keys";
import type { Server } from "~/store/settings";

type QueryProps = { stale?: boolean };

export function useSession({ stale = false }: QueryProps = { stale: false }) {
  const client = useClient();
  const server = useServer();
  return useQuery<Session | undefined, Error>({
    queryKey: queryKeys.sessionGet(server),
    queryFn: async () => client?.getSession(),
    enabled: Boolean(client) && !stale,
    staleTime: 5_000,
  });
}

export function useSessionSet() {
  const queryClient = useQueryClient();
  const client = useClient();
  const server = useServer();

  return useMutation<void, Error, Partial<Session>, { previous?: Session }>({
    mutationFn: async (params: Partial<Session>) => {
      await client?.setSession(params);
    },
    onMutate: async (params: Partial<Session>) => {
      await queryClient.cancelQueries(queryMatchers.session(server));
      const previous = queryClient.getQueryData<Session | undefined>(queryKeys.sessionGet(server));

      queryClient.setQueryData(
        queryKeys.sessionGet(server),
        (old: Session | undefined): Session | undefined => {
          if (!old) return;
          return { ...old, ...params };
        },
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

export function useSessionStats({ stale = false }: QueryProps = { stale: false }) {
  const client = useClient();
  const server = useServer();
  return useQuery<SessionStats | undefined, Error>({
    queryKey: queryKeys.sessionStats(server),
    queryFn: async () => client?.getSessionStats(),
    enabled: Boolean(client) && !stale,
    refetchInterval: (query) => (query.state.status === "error" ? false : 5_000),
    staleTime: 5_000,
  });
}

export function useServerSession(server: Server | undefined) {
  const client = useServerClient(server);
  return useQuery<Session | undefined>({
    queryKey: ["config-session", server?.id, server?.url],
    queryFn: async () => client?.getSession(),
    enabled: Boolean(client),
    staleTime: Infinity,
  });
}

export function useServerPreferences(server: Server | undefined) {
  const client = useServerClient(server);
  return useQuery<Record<string, unknown> | undefined>({
    queryKey: ["config-preferences", server?.id, server?.url],
    queryFn: async () => client?.getPreferences(),
    enabled: Boolean(client),
    staleTime: Infinity,
  });
}

export function useServerPreferencesSet(server: Server | undefined) {
  const queryClient = useQueryClient();
  const client = useServerClient(server);
  const key = ["config-preferences", server?.id, server?.url];

  return useMutation<void, Error, Record<string, unknown>, { previous?: Record<string, unknown> }>({
    mutationFn: async (params) => {
      await client?.setPreferences(params);
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Record<string, unknown>>(key);
      queryClient.setQueryData(key, (old: Record<string, unknown> | undefined) => {
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

export function useServerSessionSet(server: Server | undefined) {
  const queryClient = useQueryClient();
  const client = useServerClient(server);
  const key = ["config-session", server?.id, server?.url];

  return useMutation<void, Error, Partial<Session>, { previous?: Session }>({
    mutationFn: async (params) => {
      await client?.setSession(params);
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Session | undefined>(key);
      queryClient.setQueryData(key, (old: Session | undefined) => {
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
