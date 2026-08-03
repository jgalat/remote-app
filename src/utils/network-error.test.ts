import { describe, expect, it } from "vitest";
import { getNetworkErrorContent } from "./network-error";

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
