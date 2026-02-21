export class HTTPError extends Error {
  constructor(
    public readonly status: number,
    message: string
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
