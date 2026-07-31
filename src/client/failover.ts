import type { TorrentClient } from "./interface";

export function isRetryableConnectionError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  if (error.name === "RequestTimeoutError" || error.name === "AbortError") {
    return true;
  }

  if (!("status" in error) || typeof error.status !== "number") {
    return false;
  }

  return [408, 502, 503, 504].includes(error.status);
}

export function createFailoverClient(clients: TorrentClient[]): TorrentClient {
  const primary = clients[0];
  if (!primary) throw new Error("At least one torrent client is required");

  let activeIndex = 0;

  return new Proxy(primary, {
    get(_target, property) {
      const value = clients[activeIndex][property as keyof TorrentClient];
      if (typeof value !== "function") return value;

      return async (...args: unknown[]) => {
        let lastError: unknown;

        for (let offset = 0; offset < clients.length; offset += 1) {
          const index = (activeIndex + offset) % clients.length;
          const client = clients[index];
          const method = client[property as keyof TorrentClient];

          try {
            const result = await (
              method as (...params: unknown[]) => Promise<unknown>
            ).apply(client, args);
            activeIndex = index;
            return result;
          } catch (error) {
            if (!isRetryableConnectionError(error)) throw error;
            lastError = error;
          }
        }

        throw lastError;
      };
    },
  }) as TorrentClient;
}
