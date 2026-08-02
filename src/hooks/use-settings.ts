import "~/store/migrations";

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
import { normalizeServerScope } from "~/utils/server-scope";
import { loadSearch, storeSearch, type SearchConfig } from "~/store/search";
import {
  loadPreferences,
  storePreferences,
  type ColorScheme,
  type FontFamily,
} from "~/store/preferences";
import {
  loadDirectories,
  storeDirectories,
  type DirectoriesData,
} from "~/store/directories";
import { cleanupOrphanedData } from "~/store/cleanup";

const serversKey = ["settings", "servers"] as const;
const listingKey = ["settings", "listing"] as const;
const searchKey = ["settings", "search"] as const;
const preferencesKey = ["settings", "preferences"] as const;
const directoriesKey = ["settings", "directories"] as const;

type ServersData = { servers: Server[]; activeServerId?: string };
type PreferencesData = {
  colorScheme: ColorScheme;
  authentication: boolean;
  developmentMode: boolean;
  fontFamily: FontFamily;
};

const queryOptions = { staleTime: Infinity } as const;

function useServersQuery() {
  return useQuery({
    queryKey: serversKey,
    queryFn: loadServers,
    initialData: loadServers,
    ...queryOptions,
  });
}

function loadAvailableListing(): ListingData {
  const listing = loadListing();
  const serverScope = normalizeServerScope(
    listing.serverScope,
    loadServers().servers.length,
  );
  if (serverScope === listing.serverScope) return listing;

  const updated = { ...listing, serverScope };
  storeListing(updated);
  return updated;
}

function useListingQuery() {
  return useQuery({
    queryKey: listingKey,
    queryFn: loadAvailableListing,
    initialData: loadAvailableListing,
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

function useDirectoriesQuery() {
  return useQuery({
    queryKey: directoriesKey,
    queryFn: loadDirectories,
    initialData: loadDirectories,
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

      const listing = loadListing();
      const serverScope = normalizeServerScope(
        listing.serverScope,
        updated.servers.length,
      );
      if (serverScope !== listing.serverScope) {
        storeListing({ ...listing, serverScope });
      }

      cleanupOrphanedData(new Set(updated.servers.map((s) => s.id)));
      return updated;
    },
    onSettled: (data) => {
      if (data === undefined) return;
      queryClient.setQueryData(serversKey, data);
      queryClient.setQueryData(listingKey, loadAvailableListing());
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
    onMutate: (diff: Partial<PreferencesData>) => {
      const previous = queryClient.getQueryData<PreferencesData>(preferencesKey);
      queryClient.setQueryData<PreferencesData>(preferencesKey, (current) => ({
        ...(current ?? data),
        ...diff,
      }));
      return { previous };
    },
    onError: (_error, _diff, context) => {
      if (context?.previous) {
        queryClient.setQueryData(preferencesKey, context.previous);
      }
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

export function useDirectoriesStore() {
  const queryClient = useQueryClient();
  const { data: directories } = useDirectoriesQuery();

  const { mutate: store } = useMutation({
    mutationFn: async (diff: Partial<DirectoriesData>) => {
      const current = loadDirectories();
      const updated = { ...current, ...diff };
      storeDirectories(updated);
      return updated;
    },
    onSettled: (data) => {
      if (data !== undefined) queryClient.setQueryData(directoriesKey, data);
    },
  });

  return { directories, store };
}

export function useDirectories(serverId: string | undefined) {
  const { data } = useDirectoriesQuery();
  const { servers } = useServersQuery().data;
  const serverDirs = serverId ? data.servers[serverId] ?? [] : [];
  // Global directories are filesystem paths shared across remote servers
  // (e.g. /downloads on every Transmission instance pointing at the same
  // mount). They make no sense for the local libtorrent4j engine, whose
  // valid paths are device-local.
  const isLocal =
    serverId !== undefined &&
    servers.find((s) => s.id === serverId)?.type === "local";
  const globals = isLocal ? [] : data.global;
  return [...new Set([...globals, ...serverDirs])];
}

export function useAllDirectories() {
  const { data } = useDirectoriesQuery();
  const { servers } = useServersQuery().data;
  return [
    ...new Set([
      ...data.global,
      ...servers.flatMap((server) => data.servers[server.id] ?? []),
    ]),
  ];
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

// Whether the active (or given) server is the embedded libtorrent4j engine.
// Centralized so screens don't keep re-deriving it from useServer / useServers.
export function useIsLocalServer(serverId?: string): boolean {
  const { servers, activeServerId } = useServersQuery().data;
  const id = serverId ?? activeServerId;
  if (!id) return false;
  return servers.find((s) => s.id === id)?.type === "local";
}

export function useListing() {
  return useListingQuery().data;
}

export function useColorScheme(): "light" | "dark" {
  const { colorScheme } = usePreferencesQuery().data;
  const systemColorScheme = _useColorScheme();
  if (colorScheme === "system") {
    return systemColorScheme === "dark" ? "dark" : "light";
  }
  return colorScheme;
}

export function useColorSchemePreference(): ColorScheme {
  return usePreferencesQuery().data.colorScheme;
}

export function useAuthentication() {
  return usePreferencesQuery().data.authentication;
}

export function useDevelopmentMode() {
  return usePreferencesQuery().data.developmentMode;
}

export function useFontFamilyPreference(): FontFamily {
  return usePreferencesQuery().data.fontFamily;
}

export function useSearchConfig() {
  return useSearchQuery().data;
}
