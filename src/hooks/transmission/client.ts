import * as React from "react";
import TransmissionClient from "@remote-app/transmission-client";

import { useServer } from "../use-settings";
import MockTransmissionClient, {
  isTestingServer,
} from "~/utils/mock-transmission-client";
import type { Server } from "~/store/settings";

export function useTransmission(): TransmissionClient | null {
  const server = useServer();
  return React.useMemo(() => {
    if (!server) {
      return null;
    }

    if (isTestingServer(server)) {
      return new MockTransmissionClient() as TransmissionClient;
    }

    return new TransmissionClient({
      url: server.url,
      username: server.username,
      password: server.password,
    });
  }, [server]);
}

export function useServerClient(
  server: Server | undefined
): TransmissionClient | null {
  return React.useMemo(() => {
    if (!server) return null;
    if (isTestingServer(server)) {
      return new MockTransmissionClient() as unknown as TransmissionClient;
    }
    return new TransmissionClient({
      url: server.url,
      username: server.username,
      password: server.password,
    });
  }, [server]);
}
