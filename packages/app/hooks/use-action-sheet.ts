import * as React from "react";

import { ActionSheetContext } from "../contexts/action-sheet";

export default function useActionSheet() {
  return React.useContext(ActionSheetContext);
}
