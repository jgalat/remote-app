import * as React from "react";
import { StyleSheet } from "react-native";
import _ActionSheet, { SheetManager } from "react-native-actions-sheet";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Text from "~/components/text";
import View from "~/components/view";
import Pressable from "~/components/pressable";
import Option from "~/components/option";
import { useTheme } from "~/hooks/use-theme-color";
import { useListingStore, useActiveServerId, useDirectories } from "~/hooks/use-settings";
import { useTorrents, useSession } from "~/hooks/torrent";
import predicate from "~/utils/filter";

import type { SheetProps } from "react-native-actions-sheet";
import type { Sort, Filter } from "~/store/settings";
import type { SelectOption } from "./select";
import type { OptionProps } from "~/components/option";

const sheetId = "listing" as const;
const tabs = ["sort", "filter"] as const;
type Tab = (typeof tabs)[number];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ListingSheet(_: SheetProps<typeof sheetId>) {
  const { background, text, tint } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: torrents } = useTorrents({ stale: true });
  const { data: session } = useSession({ stale: true });
  const activeServerId = useActiveServerId();
  const savedDirs = useDirectories(activeServerId);
  const { listing, store } = useListingStore();
  const { sort, direction, filter, pathFilter } = listing;
  const [tab, setTab] = React.useState<Tab>("sort");

  const updateSort = React.useCallback(
    (s: Sort) => {
      return () => {
        if (s === sort) {
          return store({
            direction: direction === "desc" ? "asc" : "desc",
          });
        }
        return store({
          direction: "asc",
          sort: s,
        });
      };
    },
    [sort, direction, store]
  );

  const sortRight = React.useCallback(
    (s: Sort): React.ComponentProps<typeof Feather>["name"] | undefined =>
      s !== sort
        ? undefined
        : direction === "asc"
        ? "chevron-down"
        : "chevron-up",
    [sort, direction]
  );

  const sortOptions = React.useMemo<OptionProps[]>(
    () => [
      { label: "Queue", left: "chevron-right", onPress: updateSort("queue"), right: sortRight("queue") },
      { label: "Activity", left: "chevron-right", onPress: updateSort("activity"), right: sortRight("activity") },
      { label: "Age", left: "chevron-right", onPress: updateSort("age"), right: sortRight("age") },
      { label: "Name", left: "chevron-right", onPress: updateSort("name"), right: sortRight("name") },
      { label: "Progress", left: "chevron-right", onPress: updateSort("progress"), right: sortRight("progress") },
      { label: "Size", left: "chevron-right", onPress: updateSort("size"), right: sortRight("size") },
      { label: "Status", left: "chevron-right", onPress: updateSort("status"), right: sortRight("status") },
      { label: "Time Remaining", left: "chevron-right", onPress: updateSort("time-remaining"), right: sortRight("time-remaining") },
      { label: "Ratio", left: "chevron-right", onPress: updateSort("ratio"), right: sortRight("ratio") },
    ],
    [updateSort, sortRight]
  );

  const updateFilter = React.useCallback(
    (f: Filter) => {
      return () => {
        store({ filter: f });
      };
    },
    [store]
  );

  const filterRight = React.useCallback(
    (f: Filter): React.ComponentProps<typeof Feather>["name"] | undefined =>
      f === filter ? "check" : undefined,
    [filter]
  );

  const filterLeft = React.useCallback(
    (f: Filter) => torrents?.filter(predicate(f)).length ?? 0,
    [torrents]
  );

  const filterOptions = React.useMemo<OptionProps[]>(
    () => [
      { label: "All", left: filterLeft("all"), onPress: updateFilter("all"), right: filterRight("all") },
      { label: "Active", left: filterLeft("active"), onPress: updateFilter("active"), right: filterRight("active") },
      { label: "Downloading", left: filterLeft("downloading"), onPress: updateFilter("downloading"), right: filterRight("downloading") },
      { label: "Seeding", left: filterLeft("seeding"), onPress: updateFilter("seeding"), right: filterRight("seeding") },
      { label: "Paused", left: filterLeft("paused"), onPress: updateFilter("paused"), right: filterRight("paused") },
      { label: "Completed", left: filterLeft("completed"), onPress: updateFilter("completed"), right: filterRight("completed") },
      { label: "Finished", left: filterLeft("finished"), onPress: updateFilter("finished"), right: filterRight("finished") },
    ],
    [filterLeft, updateFilter, filterRight]
  );

  const defaultDir = session?.["download-dir"];
  const pathLabel = pathFilter || "Path";

  const openPathPicker = React.useCallback(() => {
    const dirs = new Set<string>();
    if (defaultDir) dirs.add(defaultDir);
    for (const d of savedDirs) dirs.add(d);

    const countByDir = new Map<string, number>();
    if (torrents) {
      for (const t of torrents) {
        countByDir.set(t.downloadDir, (countByDir.get(t.downloadDir) ?? 0) + 1);
      }
    }

    const options: SelectOption[] = [
      {
        value: "",
        label: "All",
        left: torrents?.length ?? 0,
        right: pathFilter === "" ? "check" : undefined,
      },
      ...[...dirs].map((dir) => ({
        value: dir,
        label: dir,
        left: countByDir.get(dir) ?? 0,
        right: pathFilter === dir ? ("check" as const) : undefined,
      })),
    ];

    SheetManager.show("select", {
      payload: {
        title: "Path",
        options,
        onSelect: (value: string | number) => {
          store({ pathFilter: String(value) });
        },
      },
    });
  }, [pathFilter, defaultDir, savedDirs, torrents, store]);

  const options = tab === "sort" ? sortOptions : filterOptions;

  return (
    <_ActionSheet
      id={sheetId}
      containerStyle={{
        backgroundColor: background,
        borderWidth: 2,
        borderColor: text,
        borderBottomWidth: 0,
      }}
      indicatorStyle={{
        backgroundColor: text,
        marginTop: 12,
        height: 4,
      }}
      openAnimationConfig={{ speed: 50, bounciness: 0 }}
      closeAnimationConfig={{ speed: 50, bounciness: 0 }}
      gestureEnabled
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={[styles.segmented, { borderColor: text }]}>
          {tabs.map((t) => (
            <Pressable
              key={t}
              style={[styles.segment, tab === t && { backgroundColor: tint }]}
              onPress={() => setTab(t)}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: tab === t ? background : text },
                ]}
              >
                {t === "sort" ? "Sort" : "Filter"}
              </Text>
            </Pressable>
          ))}
        </View>
        {tab === "filter" && (
          <>
            <Pressable style={styles.pathRow} onPress={openPathPicker}>
              <View style={styles.pathIcon}>
                <Feather name="folder" size={24} color={text} />
              </View>
              <View style={styles.pathLabel}>
                <Text numberOfLines={1}>{pathLabel}</Text>
              </View>
              <Feather name="book" size={24} color={text} />
            </Pressable>
            <View style={[styles.separator, { backgroundColor: text, opacity: 0.15 }]} />
          </>
        )}
        {options.map((option) => (
          <Option key={option.label} {...option} style={styles.option} />
        ))}
      </View>
    </_ActionSheet>
  );
}

ListingSheet.sheetId = sheetId;

export default ListingSheet;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
  },
  segmented: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: "RobotoMono-Medium",
  },
  pathRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  pathIcon: {
    width: "15%",
    alignItems: "center",
  },
  pathLabel: {
    flex: 1,
    marginLeft: 24,
    marginRight: 16,
  },
  separator: {
    height: 1,
    marginVertical: 12,
  },
  option: {
    marginBottom: 4,
  },
});
