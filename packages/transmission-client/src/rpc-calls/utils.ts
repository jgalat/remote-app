export type Identifiers = {
  ids?: number | (number | string)[] | "recently-active";
};

export type Fields<T> = {
  fields: readonly T[];
};
