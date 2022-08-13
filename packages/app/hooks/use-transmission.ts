import * as React from "react";
import TransmissionClient from "transmission-client"

function useTransmission() {
  const ref = React.useRef(new TransmissionClient())
}
