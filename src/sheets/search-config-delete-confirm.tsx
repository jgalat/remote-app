import * as React from "react";
import { router } from "expo-router";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import { useTheme } from "~/hooks/use-theme-color";
import { useSearchStore } from "~/hooks/use-settings";

export type Payload = {
  label?: string;
};

const sheetId = "search-config-delete-confirm" as const;

function SearchConfigDeleteConfirmSheet({
  payload,
  ...props
}: SheetProps<typeof sheetId>) {
  const { red } = useTheme();
  const { store } = useSearchStore();

  const onDelete = React.useCallback(() => {
    store(null);
    router.back();
  }, [store]);

  return (
    <ActionSheet
      title={`Delete ${payload?.label ?? "search config"}?`}
      options={[
        {
          label: "Delete",
          left: "trash",
          color: red,
          onPress: onDelete,
        },
      ]}
      {...props}
    />
  );
}

SearchConfigDeleteConfirmSheet.sheetId = sheetId;

export default SearchConfigDeleteConfirmSheet;
