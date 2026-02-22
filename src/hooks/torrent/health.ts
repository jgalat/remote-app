import * as React from "react";
import { useQueries } from "@tanstack/react-query";

import { createClient } from "~/client";
import MockClient, { isTestingServer } from "~/utils/mock-transmission-client";
import type { Server } from "~/store/settings";

export type HealthStatus = "pending" | "ok" | "error";

export function useHealthPing(servers: Server[]): Record<string, HealthStatus> {
  const queries = React.useMemo(
    () =>
      servers.map((server) => ({
        queryKey: ["health-ping", server.id, server.url] as const,
        queryFn: async () => {
          const client = isTestingServer(server)
            ? new MockClient()
            : createClient(server);
          await client.ping();
          return true;
        },
        retry: false,
        staleTime: Infinity,
      })),
    [servers]
  );

  const results = useQueries({
    queries,
  });

  const statuses: Record<string, HealthStatus> = {};
  for (let i = 0; i < servers.length; i++) {
    const result = results[i];
    if (result.isPending) {
      statuses[servers[i].id] = "pending";
    } else if (result.isSuccess) {
      statuses[servers[i].id] = "ok";
    } else {
      statuses[servers[i].id] = "error";
    }
  }
  return statuses;
}
