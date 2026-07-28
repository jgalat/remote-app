export class HTTPError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly body?: string
  ) {
    super(message);
    this.name = "HTTPError";
  }
}

export class TransmissionError extends Error {
  constructor(public readonly message: string) {
    super(message);
    this.name = "TransmissionError";
  }
}

export class ResponseParseError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super("The server returned an unexpected response");
    this.name = "ResponseParseError";
  }
}

export class RequestTimeoutError extends Error {
  constructor(public readonly timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`);
    this.name = "RequestTimeoutError";
  }
}
