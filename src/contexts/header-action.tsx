import * as React from "react";
import useNonNullContext from "~/hooks/use-non-null-context";

export type HeaderAction = (() => void) | null;

type HeaderActionState = {
  action: HeaderAction;
  setAction: (action: HeaderAction) => void;
};

export const HeaderActionContext = React.createContext<HeaderActionState | null>(
  null
);
HeaderActionContext.displayName = "HeaderActionContext";

export function HeaderActionProvider({ children }: React.PropsWithChildren) {
  const [action, setAction] = React.useState<HeaderAction>(null);

  const value = React.useMemo(() => ({ action, setAction }), [action]);

  return (
    <HeaderActionContext.Provider value={value}>
      {children}
    </HeaderActionContext.Provider>
  );
}

export function useHeaderAction() {
  return useNonNullContext(HeaderActionContext);
}
