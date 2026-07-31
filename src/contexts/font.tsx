import * as React from "react";

import { useFontFamilyPreference } from "~/hooks/use-settings";
import type { FontFamily } from "~/store/settings";
import useNonNullContext from "~/hooks/use-non-null-context";

const FontContext = React.createContext<FontFamily | null>(null);

export function FontProvider({ children }: React.PropsWithChildren) {
  const fontFamily = useFontFamilyPreference();
  return (
    <FontContext.Provider value={fontFamily}>{children}</FontContext.Provider>
  );
}

export function useFontPreference(): FontFamily {
  return useNonNullContext(FontContext);
}

export function useAppFontFamily(
  weight: "regular" | "medium" = "regular",
): string {
  const preference = useFontPreference();

  if (preference === "mono") {
    return weight === "medium"
      ? "RobotoMono-Medium"
      : "RobotoMono-Regular";
  }

  return weight === "medium" ? "sans-serif-medium" : "sans-serif";
}
