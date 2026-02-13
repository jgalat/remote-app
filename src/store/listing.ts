import { z } from "zod";

import { storage } from "./storage";

const SortSchema = z.enum([
  "queue",
  "activity",
  "age",
  "name",
  "progress",
  "size",
  "status",
  "time-remaining",
  "ratio",
]);
export type Sort = z.infer<typeof SortSchema>;

const DirectionSchema = z.enum(["asc", "desc"]);
export type Direction = z.infer<typeof DirectionSchema>;

const FilterSchema = z.enum([
  "all",
  "active",
  "downloading",
  "seeding",
  "paused",
  "completed",
  "finished",
]);
export type Filter = z.infer<typeof FilterSchema>;

const ListingSchema = z.object({
  sort: SortSchema,
  direction: DirectionSchema,
  filter: FilterSchema,
});

export type ListingData = z.infer<typeof ListingSchema>;

const KEY = "user.listing";

export const defaults: ListingData = {
  sort: "queue",
  direction: "asc",
  filter: "all",
};

export function loadListing(): ListingData {
  const value = storage.getString(KEY);
  if (value === undefined) return defaults;

  try {
    const result = ListingSchema.safeParse(JSON.parse(value));
    if (result.success) return result.data;
    storeListing(defaults);
    return defaults;
  } catch {
    storeListing(defaults);
    return defaults;
  }
}

export function storeListing(data: ListingData): void {
  storage.set(KEY, JSON.stringify(data));
}
