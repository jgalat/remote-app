export class HTTPError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string
  ) {
    super(message);
    this.name = "HTTPError";
  }
}

export class QBittorrentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QBittorrentError";
  }
}

export class RequestTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "RequestTimeoutError";
  }
}
