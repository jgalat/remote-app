import * as React from "react";
import { ClientContext } from "../contexts/transmission-client";

export function useTransmission() {
  return React.useContext(ClientContext);
}
