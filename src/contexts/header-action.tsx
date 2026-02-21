import * as React from "react";

type HeaderAction = (() => void) | null;

type HeaderActionContext = {
  action: HeaderAction;
  setAction: (action: HeaderAction) => void;
};

export const HeaderActionContext = React.createContext<HeaderActionContext>({
  action: null,
  setAction: () => {},
});

export function HeaderActionProvider({ children }: React.PropsWithChildren) {
  const [action, setAction] = React.useState<HeaderAction>(null);

  const value = React.useMemo(() => ({ action, setAction }), [action]);

  return (
    <HeaderActionContext.Provider value={value}>
      {children}
    </HeaderActionContext.Provider>
  );
}
