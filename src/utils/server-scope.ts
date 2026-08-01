export function normalizeServerScope(
  scope: "active" | "all",
  serverCount: number,
): "active" | "all" {
  if (serverCount > 1) return scope;
  return "active";
}
