import { useMutation } from "@tanstack/react-query";

import type { PortCheck } from "~/client/types";
import type { Server } from "~/store/settings";
import { useServerClient } from "./client";

export function useServerPortCheck(server: Server | undefined) {
  const client = useServerClient(server);
  const mutation = useMutation<PortCheck, Error>({
    mutationFn: async () => {
      if (!client?.checkPort) throw new Error("Port check is not supported");
      return await client.checkPort();
    },
  });
  return { ...mutation, supported: Boolean(client?.checkPort) };
}
