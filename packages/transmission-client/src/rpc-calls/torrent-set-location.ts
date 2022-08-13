import type { Identifiers } from "./utils";

export type Request = Identifiers & {
  location: string;
  move?: boolean;
};
