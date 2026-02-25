import { z } from "zod";

import { storage } from "./storage";

export const SearchConfigSchema = z.object({
  url: z.string(),
  apiKey: z.string(),
  type: z.enum(["jackett", "prowlarr"]).default("jackett"),
});

export type SearchConfig = z.infer<typeof SearchConfigSchema>;

const KEY = "user.search";

export function loadSearch(): SearchConfig | null {
  const value = storage.getString(KEY);
  if (value === undefined) return null;

  try {
    const result = SearchConfigSchema.safeParse(JSON.parse(value));
    if (result.success) return result.data;
    storage.delete(KEY);
    return null;
  } catch {
    storage.delete(KEY);
    return null;
  }
}

export function storeSearch(data: SearchConfig | null): void {
  if (data === null) {
    storage.delete(KEY);
    return;
  }
  storage.set(KEY, JSON.stringify(data));
}
