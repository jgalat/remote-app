import * as React from "react";
import { useRouter } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useServersStore, useServer } from "~/hooks/use-settings";
import { usePro } from "@remote-app/pro";
import type { OptionProps } from "~/components/option";

const sheetId = "server-selector" as const;

function ServerSelectorSheet(props: SheetProps<typeof sheetId>) {
  const router = useRouter();
  const { servers, store } = useServersStore();
  const { canUse, available } = usePro();
  const active = useServer();

  const options = React.useMemo<OptionProps[]>(() => {
    const serverOptions: OptionProps[] = servers.map((server) => ({
      label: server.name,
      left: "server",
      right: server.id === active?.id ? "check" : undefined,
      onPress: () => store({ activeServerId: server.id }),
    }));

    const canAdd = servers.length === 0 || canUse("multi-server");

    if (!available && servers.length > 0) {
      return serverOptions;
    }

    return [
      ...serverOptions,
      {
        label: "Add Server",
        left: "plus" as const,
        onPress: () =>
          canAdd
            ? router.push("/settings/connection")
            : router.push("/paywall"),
      },
    ];
  }, [servers, active?.id, store, router, available, canUse]);

  return <ActionSheet title="Servers" options={options} {...props} />;
}

ServerSelectorSheet.sheetId = sheetId;

export default ServerSelectorSheet;
