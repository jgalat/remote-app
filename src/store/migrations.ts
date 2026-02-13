import { z } from "zod";

import { storage } from "./storage";
import { storeServers, generateServerId } from "./servers";
import { storeListing } from "./listing";
import { storeSearch } from "./search";
import { storePreferences } from "./preferences";

// -- Migration schemas (only used for parsing the old key) --

const ServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

const ColorSchemeSchema = z.enum(["system", "dark", "light"]);

const ListingSchema = z.object({
  sort: z.enum(["queue", "activity", "age", "name", "progress", "size", "status", "time-remaining", "ratio"]),
  direction: z.enum(["asc", "desc"]),
  filter: z.enum(["all", "active", "downloading", "seeding", "paused", "completed", "finished"]),
});

const SearchConfigSchema = z.object({
  url: z.string(),
  apiKey: z.string(),
  type: z.enum(["jackett", "prowlarr"]).default("jackett"),
});

const MultiServerSchema = z.object({
  servers: z.array(ServerSchema),
  activeServerId: z.string().optional(),
  colorScheme: ColorSchemeSchema,
  authentication: z.boolean(),
  listing: ListingSchema,
  searchConfig: SearchConfigSchema.optional(),
});

const SingleServerEntrySchema = z.object({
  name: z.string(),
  url: z.string(),
  username: z.string().optional(),
  password: z.string().optional(),
});

const SingleServerSchema = z.object({
  server: SingleServerEntrySchema.optional(),
  colorScheme: ColorSchemeSchema.optional(),
  authentication: z.boolean().optional(),
  listing: ListingSchema.partial().optional(),
});

// -- Migration: runs once on module import --

const LEGACY_KEY = "user.settings";

(function migrate() {
  const value = storage.getString(LEGACY_KEY);
  if (value === undefined) return;

  try {
    const json: unknown = JSON.parse(value);

    const multi = MultiServerSchema.safeParse(json);
    if (multi.success) {
      const d = multi.data;
      storeServers({ servers: d.servers, activeServerId: d.activeServerId });
      storeListing(d.listing);
      storeSearch(d.searchConfig ?? null);
      storePreferences({ colorScheme: d.colorScheme, authentication: d.authentication });
      storage.delete(LEGACY_KEY);
      return;
    }

    const single = SingleServerSchema.safeParse(json);
    if (single.success) {
      const d = single.data;
      const servers: z.infer<typeof ServerSchema>[] = [];
      let activeServerId: string | undefined;

      if (d.server) {
        const now = Date.now();
        const id = generateServerId();
        servers.push({
          id,
          name: d.server.name,
          url: d.server.url,
          username: d.server.username,
          password: d.server.password,
          createdAt: now,
          updatedAt: now,
        });
        activeServerId = id;
      }

      storeServers({ servers, activeServerId });
      storeListing({
        sort: d.listing?.sort ?? "queue",
        direction: d.listing?.direction ?? "asc",
        filter: d.listing?.filter ?? "all",
      });
      storeSearch(null);
      storePreferences({
        colorScheme: d.colorScheme ?? "system",
        authentication: d.authentication ?? false,
      });
      storage.delete(LEGACY_KEY);
      return;
    }
  } catch {
    // corrupt data
  }

  storage.delete(LEGACY_KEY);
})();
