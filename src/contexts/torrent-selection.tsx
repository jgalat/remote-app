import * as React from "react";
import { BackHandler } from "react-native";
import type { Torrent } from "@remote-app/transmission-client";

type Action =
  | {
      type: "toggle";
      payload: Torrent["id"];
    }
  | {
      type: "clear";
    };

type State = {
  active: boolean;
  selection: Set<Torrent["id"]>;
};

const initState: State = {
  active: false,
  selection: new Set(),
};

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "toggle": {
      const s = new Set(state.selection);
      if (s.has(action.payload)) {
        s.delete(action.payload);
      } else {
        s.add(action.payload);
      }

      return { active: s.size > 0, selection: s };
    }
    case "clear":
      return initState;
  }
}

type TorrentSelection = {
  toggle: (id: Torrent["id"]) => void;
  clear: () => void;
} & State;

export const TorrentSelectionContext =
  React.createContext<TorrentSelection | null>(null);

export function TorrentSelectionProvider({
  children,
}: React.PropsWithChildren) {
  const [state, dispatch] = React.useReducer(reducer, initState);

  const toggle = React.useCallback(
    (id: Torrent["id"]) => dispatch({ type: "toggle", payload: id }),
    []
  );

  const clear = React.useCallback(() => dispatch({ type: "clear" }), []);

  React.useEffect(() => {
    if (!state.active) {
      return;
    }

    const action = () => {
      clear();
      return true;
    };

    const handler = BackHandler.addEventListener("hardwareBackPress", action);
    return () => handler.remove();
  }, [state.active, clear]);

  const value: TorrentSelection = { ...state, toggle, clear };

  return (
    <TorrentSelectionContext.Provider value={value}>
      {children}
    </TorrentSelectionContext.Provider>
  );
}
