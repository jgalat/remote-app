import * as React from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

import { Settings, loadSettings, storeSettings } from "../store/settings";

export type AppSettings = {
  settings: Settings;
  store: (diff: Partial<Settings>) => void;
};

export const SettingsContext = React.createContext<AppSettings | null>(null);

const queryKey = ["app-settings"] as const;

export function SettingsProvider({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey,
    queryFn: loadSettings,
  });

  const { mutate: store } = useMutation({
    mutationFn: async (diff: Partial<Settings>) => {
      const current = queryClient.getQueryData<Settings>(queryKey);

      if (!current) {
        return;
      }

      const settings = { ...current, ...diff };
      storeSettings(settings);
      return settings;
    },
    onSettled: (settings) => {
      if (!settings) {
        return;
      }
      queryClient.setQueryData(queryKey, settings);
    },
  });

  const value = React.useMemo(
    () => (settings ? { settings, store } : null),
    [settings, store]
  );

  if (isLoading || !value) {
    return null;
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
