import { z } from "zod";

import { storage } from "./storage";

const ColorSchemeSchema = z.enum(["system", "dark", "light"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
const FontFamilySchema = z.enum(["mono", "system"]);
export type FontFamily = z.infer<typeof FontFamilySchema>;

export const PreferencesSchema = z.object({
  colorScheme: ColorSchemeSchema,
  authentication: z.boolean(),
  developmentMode: z.boolean().default(false),
  fontFamily: FontFamilySchema.default("mono"),
});

type PreferencesData = z.infer<typeof PreferencesSchema>;

const KEY = "user.preferences";

const defaults: PreferencesData = {
  colorScheme: "system",
  authentication: false,
  developmentMode: false,
  fontFamily: "mono",
};

export function loadPreferences(): PreferencesData {
  const value = storage.getString(KEY);
  if (value === undefined) return defaults;

  try {
    const result = PreferencesSchema.safeParse(JSON.parse(value));
    if (result.success) return result.data;
    storePreferences(defaults);
    return defaults;
  } catch {
    storePreferences(defaults);
    return defaults;
  }
}

export function storePreferences(data: PreferencesData): void {
  storage.set(KEY, JSON.stringify(data));
}
