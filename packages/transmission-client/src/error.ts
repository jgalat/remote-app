export class HTTPError extends Error {
  constructor(readonly status: number, readonly message: string) {
    super(message);
    this.name = "HTTPError";
  }
}

export class TransmissionError extends Error {
  constructor(readonly message: string) {
    super(message);
    this.name = "TransmissionError";
  }
}
