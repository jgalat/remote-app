import { z } from "zod";

import { storage } from "./storage";

const DirectoriesSchema = z.object({
  global: z.array(z.string()),
  servers: z.record(z.string(), z.array(z.string())),
});

export type DirectoriesData = z.infer<typeof DirectoriesSchema>;

const KEY = "user.directories";

const defaults: DirectoriesData = {
  global: [],
  servers: {},
};

export function loadDirectories(): DirectoriesData {
  const value = storage.getString(KEY);
  if (value === undefined) return defaults;

  try {
    const result = DirectoriesSchema.safeParse(JSON.parse(value));
    if (result.success) return result.data;
    storeDirectories(defaults);
    return defaults;
  } catch {
    storeDirectories(defaults);
    return defaults;
  }
}

export function storeDirectories(data: DirectoriesData): void {
  storage.set(KEY, JSON.stringify(data));
}
