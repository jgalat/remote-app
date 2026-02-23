import * as React from "react";

import ActionSheet, { SheetProps } from "~/components/action-sheet";
import type { OptionProps } from "~/components/option";
import { SELECT_SHEET_ID } from "./ids";

export type SelectOption = Omit<OptionProps, "onPress"> & {
  value: string | number;
};

export type Payload = {
  title?: string;
  options: SelectOption[];
  onSelect: (value: string | number) => void;
};

function SelectSheet({
  payload: { title, options = [], onSelect } = {
    options: [],
    onSelect: () => {},
  },
  ...props
}: SheetProps<typeof SELECT_SHEET_ID>) {
  const sheetOptions: OptionProps[] = options.map(
    ({ value, ...optionProps }) => ({
      ...optionProps,
      onPress: () => {
        onSelect(value);
      },
    })
  );

  return <ActionSheet title={title} options={sheetOptions} {...props} />;
}

SelectSheet.sheetId = SELECT_SHEET_ID;

export default SelectSheet;
