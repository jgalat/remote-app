export class HTTPError extends Error {
  constructor(public readonly status: number, public readonly message: string) {
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
