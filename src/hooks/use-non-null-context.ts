import * as React from "react";

export default function useNonNullContext<T>(context: React.Context<T>) {
  const ctx = React.useContext(context);
  if (ctx == null) {
    throw new Error(
      `Using ${context.displayName ?? "context"} outside of provider`
    );
  }
  return ctx;
}
