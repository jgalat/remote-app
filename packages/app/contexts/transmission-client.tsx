import * as React from "react";
import TransmissionClient from "@remote-app/transmission-client";

import { useServer } from "../hooks/use-settings";

export const ClientContext = React.createContext<
  TransmissionClient | undefined
>(undefined);

export function ClientProvider({ children }: React.PropsWithChildren) {
  const server = useServer();
  const [client, setClient] = React.useState<TransmissionClient | undefined>();

  React.useEffect(() => {
    if (!server) {
      setClient(undefined);
      return;
    }

    setClient(
      new TransmissionClient({
        url: server.url,
        username: server.username,
        password: server.password,
      })
    );
  }, [server]);

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
}
