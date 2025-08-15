export type Request = {
  ipProtocol?: "ipv4" | "ipv6";
};

export type Response = {
  "port-is-open": boolean;
  ipProtocol?: "ipv4" | "ipv6";
};