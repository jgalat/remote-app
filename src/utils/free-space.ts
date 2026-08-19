import { formatSize } from "./formatters";

export function formatAvailableSpace(bytes: number): string {
  return `${formatSize(bytes)} available`;
}
