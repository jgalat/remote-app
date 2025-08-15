import type { Identifiers } from "./utils";

export type Request = Identifiers & {
  path: string;
  name: string;
};

export type Response = {
  path: string;
  name: string;
  id: number;
};