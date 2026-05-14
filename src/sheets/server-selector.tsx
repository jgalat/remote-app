import * as React from "react";
import { useRouter } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useServersStore, useServer } from "~/hooks/use-settings";
import {
  usePro,
  useLocalEngineStatus,
  useResumeLocalEngine,
  LOCAL_SERVER_ID,
} from "@remote-app/pro";
import type { OptionProps } from "~/components/option";
import { SERVER_SELECTOR_SHEET_ID } from "./ids";

function ServerSelectorSheet(props: SheetProps<typeof SERVER_SELECTOR_SHEET_ID>) {
  const { push } = useRouter();
  const { servers, store } = useServersStore();
  const { isPro, available } = usePro();
  const active = useServer();
  const engineStatus = useLocalEngineStatus();
  const { mutate: resumeLocalEngine } = useResumeLocalEngine();

  const options = React.useMemo<OptionProps[]>(() => {
    const serverOptions: OptionProps[] = servers.map((server) => ({
      // ActionSheet keys options by id ?? label; use id so two servers with
      // the same name don't collide.
      id: server.id,
      label: server.name,
      left: server.id === LOCAL_SERVER_ID ? "hard-drive" : "server",
      right: server.id === active?.id ? "check" : undefined,
      onPress: () => store({ activeServerId: server.id }),
    }));

    const localActive = active?.id === LOCAL_SERVER_ID;
    const engineStopped =
      engineStatus.available && engineStatus.state === "stopped";

    const head: OptionProps[] = [];
    if (localActive && engineStopped) {
      head.push({
        label: "Start local service",
        left: "play" as const,
        onPress: () => resumeLocalEngine(undefined),
      });
    }

    const canAdd = servers.length === 0 || isPro;

    if (!available && servers.length > 0) {
      return [...head, ...serverOptions];
    }

    return [
      ...head,
      ...serverOptions,
      {
        label: "Add Server",
        left: "plus" as const,
        onPress: () =>
          canAdd
            ? push("/settings/connection")
            : push("/paywall"),
      },
    ];
  }, [
    servers,
    active?.id,
    store,
    push,
    available,
    isPro,
    engineStatus.available,
    engineStatus.state,
    resumeLocalEngine,
  ]);

  return <ActionSheet title="Servers" options={options} {...props} />;
}

ServerSelectorSheet.sheetId = SERVER_SELECTOR_SHEET_ID;

export default ServerSelectorSheet;
