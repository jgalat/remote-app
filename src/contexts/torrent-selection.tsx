import * as React from "react";
import { BackHandler } from "react-native";
import type { Torrent } from "~/hooks/use-transmission";

type Action =
  | {
      type: "toggle";
      payload: Torrent["id"];
    }
  | {
      type: "select";
      payload: Torrent["id"][];
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
  const s = new Set(state.selection);
  switch (action.type) {
    case "toggle": {
      if (s.has(action.payload)) {
        s.delete(action.payload);
      } else {
        s.add(action.payload);
      }
      break;
    }
    case "select": {
      for (const id of action.payload) {
        s.add(id);
      }
      break;
    }
    case "clear":
      return initState;
  }
  return { active: s.size > 0, selection: s };
}

type TorrentSelection = {
  toggle: (id: Torrent["id"]) => void;
  select: (...ids: Torrent["id"][]) => void;
  clear: () => void;
} & State;

export const TorrentSelectionContext =
  React.createContext<TorrentSelection | null>(null);

export function TorrentSelectionProvider({
  children,
}: React.PropsWithChildren) {
  const [state, dispatch] = React.useReducer(reducer, initState);

  const toggle = React.useCallback(
    async (id: Torrent["id"]) => dispatch({ type: "toggle", payload: id }),
    []
  );

  const select = React.useCallback(
    async (...ids: Torrent["id"][]) =>
      dispatch({ type: "select", payload: ids }),
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

  const value: TorrentSelection = { ...state, toggle, select, clear };

  return (
    <TorrentSelectionContext.Provider value={value}>
      {children}
    </TorrentSelectionContext.Provider>
  );
}
