import * as React from "react";
import TransmissionClient from "@remote-app/transmission-client";

import { useServer } from "../hooks/use-settings";

export const ClientContext = React.createContext<TransmissionClient | null>(
  null
);

export function ClientProvider({ children }: React.PropsWithChildren) {
  const server = useServer();
  const client = React.useMemo(() => {
    if (!server) {
      return null;
    }

    return new TransmissionClient({
      url: server.url,
      username: server.username,
      password: server.password,
    });
  }, [server]);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}
