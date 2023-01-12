import ActionSheet, { SheetProps } from "../components/action-sheet";
import { useTheme } from "../hooks/use-theme-color";
import { useTorrentActions } from "../hooks/use-transmission";

export const REMOVE_CONFIRM_SHEET_NAME = "remove-confirm";

export default function ({ payload: id, ...props }: SheetProps<number>) {
  const { red } = useTheme();
  const { remove } = useTorrentActions();

  return (
    <ActionSheet
      title="Are you sure?"
      options={[
        {
          label: "Remove",
          left: "trash",
          color: red,
          onPress: () => remove(id),
        },
        {
          label: "Remove & Trash data",
          left: "trash-2",
          color: red,
          onPress: () => remove(id, { "delete-local-data": true }),
        },
      ]}
      {...props}
    />
  );
}
