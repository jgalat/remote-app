import "~/store/settings";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useColorScheme as _useColorScheme } from "react-native";

import {
  loadServers,
  storeServers,
  getActiveServer,
  type Server,
} from "~/store/servers";
import {
  loadListing,
  storeListing,
  type ListingData,
} from "~/store/listing";
import { loadSearch, storeSearch, type SearchConfig } from "~/store/search";
import {
  loadPreferences,
  storePreferences,
  type ColorScheme,
} from "~/store/preferences";

const serversKey = ["settings", "servers"] as const;
const listingKey = ["settings", "listing"] as const;
const searchKey = ["settings", "search"] as const;
const preferencesKey = ["settings", "preferences"] as const;

type ServersData = { servers: Server[]; activeServerId?: string };
type PreferencesData = { colorScheme: ColorScheme; authentication: boolean };

const queryOptions = { staleTime: Infinity } as const;

function useServersQuery() {
  return useQuery({
    queryKey: serversKey,
    queryFn: loadServers,
    initialData: loadServers,
    ...queryOptions,
  });
}

function useListingQuery() {
  return useQuery({
    queryKey: listingKey,
    queryFn: loadListing,
    initialData: loadListing,
    ...queryOptions,
  });
}

function useSearchQuery() {
  return useQuery({
    queryKey: searchKey,
    queryFn: loadSearch,
    initialData: loadSearch,
    ...queryOptions,
  });
}

function usePreferencesQuery() {
  return useQuery({
    queryKey: preferencesKey,
    queryFn: loadPreferences,
    initialData: loadPreferences,
    ...queryOptions,
  });
}

// Combined read+write hooks

export function useServersStore() {
  const queryClient = useQueryClient();
  const { data } = useServersQuery();

  const { mutate: store } = useMutation({
    mutationFn: async (diff: Partial<ServersData>) => {
      const current = loadServers();
      const updated = { ...current, ...diff };
      storeServers(updated);
      return updated;
    },
    onSettled: (data) => {
      if (data !== undefined) queryClient.setQueryData(serversKey, data);
    },
  });

  return { ...data, store };
}

export function useListingStore() {
  const queryClient = useQueryClient();
  const { data: listing } = useListingQuery();

  const { mutate: store } = useMutation({
    mutationFn: async (diff: Partial<ListingData>) => {
      const current = loadListing();
      const updated = { ...current, ...diff };
      storeListing(updated);
      return updated;
    },
    onSettled: (data) => {
      if (data !== undefined) queryClient.setQueryData(listingKey, data);
    },
  });

  return { listing, store };
}

export function usePreferencesStore() {
  const queryClient = useQueryClient();
  const { data } = usePreferencesQuery();

  const { mutate: store } = useMutation({
    mutationFn: async (diff: Partial<PreferencesData>) => {
      const current = loadPreferences();
      const updated = { ...current, ...diff };
      storePreferences(updated);
      return updated;
    },
    onSettled: (data) => {
      if (data !== undefined) queryClient.setQueryData(preferencesKey, data);
    },
  });

  return { ...data, store };
}

export function useSearchStore() {
  const queryClient = useQueryClient();
  const { data: searchConfig } = useSearchQuery();

  const { mutate: store } = useMutation({
    mutationFn: async (config: SearchConfig | null) => {
      storeSearch(config);
      return config;
    },
    onSettled: (data) => {
      if (data !== undefined) queryClient.setQueryData(searchKey, data);
    },
  });

  return { searchConfig, store };
}

// Read-only hooks

export function useServer() {
  const { servers, activeServerId } = useServersQuery().data;
  return getActiveServer({ servers, activeServerId });
}

export function useServers() {
  return useServersQuery().data.servers;
}

export function useActiveServerId() {
  return useServersQuery().data.activeServerId;
}

export function useListing() {
  return useListingQuery().data;
}

export function useColorScheme(): "light" | "dark" {
  const { colorScheme } = usePreferencesQuery().data;
  const systemColorScheme = _useColorScheme();
  if (colorScheme === "system") {
    return systemColorScheme ?? "light";
  }
  return colorScheme;
}

export function useAuthentication() {
  return usePreferencesQuery().data.authentication;
}

export function useSearchConfig() {
  return useSearchQuery().data;
}
