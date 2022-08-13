import type { Identifiers } from "./utils";

export type Request = Identifiers & {
  "delete-local-data"?: boolean;
};
