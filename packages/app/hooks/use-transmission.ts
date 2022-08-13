import * as React from "react";
import { ClientContext } from "../contexts/transmission-client";

function useTransmission() {
  return React.useContext(ClientContext);
}


function useTorrents() {
}
