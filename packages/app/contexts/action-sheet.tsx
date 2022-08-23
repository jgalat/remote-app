import * as React from "react";
import BottomSheet from "@gorhom/bottom-sheet";

import ActionSheet, { ActionSheetProps } from "../components/action-sheet";

type SheetActions = {
  show: (props: Omit<ActionSheetProps, "innerRef">) => void;
  ref: () => React.RefObject<BottomSheet>;
};

export const ActionSheetContext = React.createContext<SheetActions>(
  {} as SheetActions
);

export function ActionSheetProvider({
  children,
}: Omit<React.ComponentProps<typeof ActionSheetContext.Provider>, "value">) {
  const ref = React.useRef<BottomSheet>(null);
  const [props, setProps] = React.useState<Omit<ActionSheetProps, "innerRef">>(
    {} as ActionSheetProps
  );

  const sheetActions = React.useMemo<SheetActions>(
    () => ({
      show: (props) => {
        setProps(props);
        setTimeout(() => ref.current?.expand(), 25);
      },
      ref: () => ref,
    }),
    [ref, setProps]
  );

  return (
    <ActionSheetContext.Provider value={sheetActions}>
      {children}
      <ActionSheet {...props} innerRef={ref} />
    </ActionSheetContext.Provider>
  );
}
