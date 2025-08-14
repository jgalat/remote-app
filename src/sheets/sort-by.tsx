import * as React from "react";
import { Feather } from "@expo/vector-icons";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import useSettings from "~/hooks/use-settings";

import type { Sort } from "~/store/settings";
import type { OptionProps } from "~/components/option";

const sheetId = "sort-by" as const;

function SortBySheet(props: SheetProps<typeof sheetId>) {
  const { settings, store } = useSettings();
  const { sort, direction } = settings.listing;

  const update = React.useCallback(
    (s: Sort): (() => void) => {
      return () => {
        if (s === sort) {
          return store({
            listing: {
              ...settings.listing,
              direction: direction === "desc" ? "asc" : "desc",
            },
          });
        }
        return store({
          listing: {
            ...settings.listing,
            direction: "asc",
            sort: s,
          },
        });
      };
    },
    [sort, direction, settings.listing, store]
  );

  const right = React.useCallback(
    (s: Sort): React.ComponentProps<typeof Feather>["name"] | undefined =>
      s !== sort
        ? undefined
        : direction === "asc"
        ? "chevron-down"
        : "chevron-up",
    [sort, direction]
  );

  const options = React.useMemo<OptionProps[]>(
    () => [
      {
        label: "Queue",
        left: "chevron-right",
        onPress: update("queue"),
        right: right("queue"),
      },
      {
        label: "Activity",
        left: "chevron-right",
        onPress: update("activity"),
        right: right("activity"),
      },
      {
        label: "Age",
        left: "chevron-right",
        onPress: update("age"),
        right: right("age"),
      },
      {
        label: "Name",
        left: "chevron-right",
        onPress: update("name"),
        right: right("name"),
      },
      {
        label: "Progress",
        left: "chevron-right",
        onPress: update("progress"),
        right: right("progress"),
      },
      {
        label: "Size",
        left: "chevron-right",
        onPress: update("size"),
        right: right("size"),
      },
      {
        label: "Status",
        left: "chevron-right",
        onPress: update("status"),
        right: right("status"),
      },
      {
        label: "Time Remaining",
        left: "chevron-right",
        onPress: update("time-remaining"),
        right: right("time-remaining"),
      },
      {
        label: "Ratio",
        left: "chevron-right",
        onPress: update("ratio"),
        right: right("ratio"),
      },
    ],
    [update, right]
  );

  return <ActionSheet title="Sort by" options={options} {...props} />;
}

SortBySheet.sheetId = sheetId;

export default SortBySheet;
