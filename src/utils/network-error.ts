export function hasErrorStatus(
  error: Error,
): error is Error & { status: number } {
  return "status" in error && typeof error.status === "number";
}

export function hasErrorBody(error: Error): error is Error & { body: string } {
  return "body" in error && typeof error.body === "string";
}

export function getNetworkErrorContent(error: Error) {
  let title = "Failed to connect";
  let message = error.message || "Unknown error";

  if (hasErrorStatus(error)) {
    title = error.message
      ? `${error.status}: ${error.message}`
      : `HTTP Status ${error.status}`;
    message = "";
  }

  if (error.name === "TransmissionError" || error.name === "QBittorrentError") {
    title = "Server Error";
  }

  if (
    error.name === "ResponseParseError" ||
    (hasErrorBody(error) && !hasErrorStatus(error))
  ) {
    title = "Unexpected response";
    message = "";
  }

  return { title, message };
}

export function getActionErrorMessage(action: string, error: Error): string {
  const { title, message } = getNetworkErrorContent(error);
  return `${action}: ${message || title}`;
}
