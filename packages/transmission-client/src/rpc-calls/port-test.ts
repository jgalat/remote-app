export type Request = {
  ip_protocol?: "ipv4" | "ipv6";
};

export type Response = {
  "port-is-open": boolean;
  ip_protocol?: "ipv4" | "ipv6";
};