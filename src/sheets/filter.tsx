import * as React from "react";
import { Feather } from "@expo/vector-icons";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import useSettings from "~/hooks/use-settings";
import { useTorrents } from "~/hooks/use-transmission";
import predicate from "~/utils/filter";

import type { Filter } from "~/store/settings";
import type { OptionProps } from "~/components/option";

const sheetId = "filter" as const;

function FilterSheet(props: SheetProps<typeof sheetId>) {
  const { data: torrents } = useTorrents();
  const { settings, store } = useSettings();
  const { filter } = settings.listing;

  const update = React.useCallback(
    (f: Filter): (() => void) => {
      return () => {
        store({
          listing: {
            ...settings.listing,
            filter: f,
          },
        });
      };
    },
    [store, settings.listing]
  );

  const right = React.useCallback(
    (f: Filter): React.ComponentProps<typeof Feather>["name"] | undefined =>
      f === filter ? "check" : undefined,
    [filter]
  );

  const left = React.useCallback(
    (f: Filter) => torrents?.filter(predicate(f)).length ?? 0,
    [torrents]
  );

  const options = React.useMemo<OptionProps[]>(
    () => [
      {
        label: "All",
        left: left("all"),
        onPress: update("all"),
        right: right("all"),
      },
      {
        label: "Active",
        left: left("active"),
        onPress: update("active"),
        right: right("active"),
      },
      {
        label: "Downloading",
        left: left("downloading"),
        onPress: update("downloading"),
        right: right("downloading"),
      },
      {
        label: "Seeding",
        left: left("seeding"),
        onPress: update("seeding"),
        right: right("seeding"),
      },
      {
        label: "Paused",
        left: left("paused"),
        onPress: update("paused"),
        right: right("paused"),
      },
      {
        label: "Completed",
        left: left("completed"),
        onPress: update("completed"),
        right: right("completed"),
      },
      {
        label: "Finished",
        left: left("finished"),
        onPress: update("finished"),
        right: right("finished"),
      },
    ],
    [left, update, right]
  );

  return <ActionSheet title="Filter" options={options} {...props} />;
}

FilterSheet.sheetId = sheetId;

export default FilterSheet;
