import { describe, expect, it } from "vitest";
import { getActionErrorMessage, getNetworkErrorContent } from "./network-error";

describe("getNetworkErrorContent", () => {
  it("describes connection failures", () => {
    expect(getNetworkErrorContent(new Error("Connection refused"))).toEqual({
      title: "Failed to connect",
      message: "Connection refused",
    });
  });

  it("describes HTTP failures", () => {
    const error = Object.assign(new Error("Unauthorized"), {
      status: 401,
      body: "Unauthorized",
    });

    expect(getNetworkErrorContent(error)).toEqual({
      title: "401: Unauthorized",
      message: "",
    });
  });

  it("describes server failures", () => {
    const error = Object.assign(new Error("Invalid request"), {
      name: "TransmissionError",
    });

    expect(getNetworkErrorContent(error)).toEqual({
      title: "Server Error",
      message: "Invalid request",
    });
  });

  it("does not label malformed successful responses as HTTP failures", () => {
    const error = Object.assign(
      new Error("The server returned an unexpected response"),
      {
        name: "ResponseParseError",
        status: 200,
        body: "<html>Not Transmission</html>",
      },
    );

    expect(getNetworkErrorContent(error)).toEqual({
      title: "Unexpected response",
      message: "",
    });
  });
});

describe("action error messages", () => {
  it("includes the operation and server reason", () => {
    expect(
      getActionErrorMessage("Failed to rename", new Error("Permission denied")),
    ).toBe("Failed to rename: Permission denied");
  });

  it("falls back when the error has no message", () => {
    expect(getActionErrorMessage("Failed to move torrent", new Error())).toBe(
      "Failed to move torrent: Unknown error",
    );
  });

  it("shows HTTP status without the response body", () => {
    const error = Object.assign(new Error("Forbidden"), {
      status: 403,
      body: "private body",
    });
    expect(getActionErrorMessage("Failed to rename", error)).toBe(
      "Failed to rename: 403: Forbidden",
    );
  });

  it("summarizes malformed responses without displaying HTML", () => {
    const error = Object.assign(new Error("Parse failed"), {
      name: "ResponseParseError",
      body: "<html>private body</html>",
    });
    expect(getActionErrorMessage("Failed to rename", error)).toBe(
      "Failed to rename: Unexpected response",
    );
  });
});
